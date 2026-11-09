import { type AccessContext, vehicleScope, requireVehicle } from './access';
import { AppError, Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import type { Reminder } from '$lib/domain/reminder';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { syncVehicleNotifications } from './notificationService';
import { requireRecord } from './service-response.helper';

type ReminderPayload = {
  type: Reminder['type'];
  dueDate: string;
  remindSchedule: Reminder['remindSchedule'];
  recurrenceType?: Reminder['recurrenceType'];
  recurrenceInterval?: number;
  recurrenceEndDate?: string | null;
  note?: string | null;
  isCompleted?: boolean;
};

type ReminderUpdatePayload = Partial<ReminderPayload>;

function reminderRecordToPayload(
  reminder: typeof schema.reminderTable.$inferSelect
): ReminderPayload {
  return {
    type: reminder.type as Reminder['type'],
    dueDate: reminder.dueDate,
    remindSchedule: reminder.remindSchedule as Reminder['remindSchedule'],
    recurrenceType: reminder.recurrenceType as Reminder['recurrenceType'],
    recurrenceInterval: reminder.recurrenceInterval,
    recurrenceEndDate: reminder.recurrenceEndDate,
    note: reminder.note,
    isCompleted: reminder.isCompleted
  };
}

const sanitizeNote = (note: unknown) => {
  if (typeof note === 'string') {
    const trimmed = note.trim();
    return trimmed.length ? trimmed : null;
  }
  return null;
};

const normalizeReminderPayload = (
  data: Partial<ReminderPayload>,
  fallback?: Partial<ReminderPayload>
) => {
  const merged = { ...fallback, ...data };
  const { type, remindSchedule, dueDate, recurrenceType, recurrenceInterval, recurrenceEndDate } =
    merged;
  if (!type) {
    throw new AppError('Reminder type is required', Status.BAD_REQUEST);
  }
  if (!remindSchedule) {
    throw new AppError('Reminder schedule is required', Status.BAD_REQUEST);
  }
  if (!dueDate) {
    throw new AppError('Reminder due date is required', Status.BAD_REQUEST);
  }
  const parsedDate = new Date(dueDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError('Invalid due date supplied', Status.BAD_REQUEST);
  }

  // Parse recurrence end date if provided
  let parsedRecurrenceEndDate = null;
  if (recurrenceEndDate) {
    parsedRecurrenceEndDate = new Date(recurrenceEndDate);
    if (Number.isNaN(parsedRecurrenceEndDate.getTime())) {
      throw new AppError('Invalid recurrence end date supplied', Status.BAD_REQUEST);
    }
  }

  return {
    type,
    dueDate: parsedDate.toISOString(),
    remindSchedule,
    recurrenceType: recurrenceType || 'none',
    recurrenceInterval: recurrenceInterval || 1,
    recurrenceEndDate: parsedRecurrenceEndDate ? parsedRecurrenceEndDate.toISOString() : null,
    note: sanitizeNote(merged.note),
    isCompleted: Boolean(merged.isCompleted)
  };
};

export const addReminder = async (
  access: AccessContext,
  vehicleId: string,
  reminderData: ReminderPayload
) => {
  await requireVehicle(access, vehicleId);
  const payload = normalizeReminderPayload(reminderData);
  const [inserted] = await db
    .insert(schema.reminderTable)
    .values({
      ...payload,
      vehicleId,
      id: undefined
    })
    .returning();

  await syncVehicleNotifications(access, vehicleId);

  return inserted;
};

export const getReminders = async (access: AccessContext, vehicleId?: string) => {
  if (vehicleId) {
    await requireVehicle(access, vehicleId);
    const reminders = await db.query.reminderTable.findMany({
      where: (reminder, { eq }) => eq(reminder.vehicleId, vehicleId),
      orderBy: (reminder, { asc }) => [asc(reminder.dueDate)]
    });

    return reminders;
  }

  const rows = await db
    .select({
      ...getTableColumns(schema.reminderTable),
      vehicleMake: schema.vehicleTable.make,
      vehicleModel: schema.vehicleTable.model,
      vehiclePlate: schema.vehicleTable.licensePlate
    })
    .from(schema.reminderTable)
    .leftJoin(schema.vehicleTable, eq(schema.reminderTable.vehicleId, schema.vehicleTable.id))
    .where(vehicleScope(schema.reminderTable.vehicleId, access))
    .orderBy(schema.reminderTable.dueDate);

  return rows;
};

export const getReminderById = async (access: AccessContext, vehicleId: string, id: string) => {
  const reminder = requireRecord(
    await db.query.reminderTable.findFirst({
      where: (reminder, { eq }) =>
        and(
          eq(reminder.id, id),
          eq(reminder.vehicleId, vehicleId),
          vehicleScope(reminder.vehicleId, access)
        )
    }),
    `No reminder found for id : ${id}`
  );

  return reminder;
};

export const updateReminder = async (
  access: AccessContext,
  vehicleId: string,
  id: string,
  reminderData: ReminderUpdatePayload
) => {
  const reminder = requireRecord(
    await db.query.reminderTable.findFirst({
      where: (reminder, { eq, and }) =>
        and(
          eq(reminder.vehicleId, vehicleId),
          eq(reminder.id, id),
          vehicleScope(reminder.vehicleId, access)
        )
    }),
    `No reminder found for id : ${id}`
  );

  const payload = normalizeReminderPayload(reminderData, reminderRecordToPayload(reminder));
  const [updated] = await db
    .update(schema.reminderTable)
    .set({ ...payload })
    .where(
      and(
        eq(schema.reminderTable.id, id),
        eq(schema.reminderTable.vehicleId, vehicleId),
        vehicleScope(schema.reminderTable.vehicleId, access)
      )
    )
    .returning();

  await syncVehicleNotifications(access, vehicleId);

  return updated;
};

export const deleteReminder = async (access: AccessContext, vehicleId: string, id: string) => {
  const existingReminder = await db.query.reminderTable.findFirst({
    where: (reminder, { eq }) =>
      and(
        eq(reminder.id, id),
        eq(reminder.vehicleId, vehicleId),
        vehicleScope(reminder.vehicleId, access)
      )
  });

  if (!existingReminder) throw new AppError('Reminder not found', Status.NOT_FOUND);
  const [result] = await db
    .delete(schema.reminderTable)
    .where(
      and(
        eq(schema.reminderTable.id, id),
        eq(schema.reminderTable.vehicleId, vehicleId),
        vehicleScope(schema.reminderTable.vehicleId, access)
      )
    )
    .returning({ id: schema.reminderTable.id });
  if (!result) throw new AppError('Reminder not found', Status.NOT_FOUND);

  if (existingReminder?.vehicleId) {
    await syncVehicleNotifications(access, existingReminder.vehicleId);
  }

  return result;
};
