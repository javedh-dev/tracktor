import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db/index';
import { eq, and } from 'drizzle-orm';
import * as schema from '$server/db/schema/index';

export const GET: RequestHandler = async ({ url }) => {
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');
  const vehicleId = url.searchParams.get('vehicleId');

  const conditions = [];

  if (vehicleId) {
    conditions.push(eq(schema.reminderTable.vehicleId, vehicleId));
  }
  if (type && type !== 'all') {
    conditions.push(eq(schema.reminderTable.type, type));
  }
  if (status === 'completed') {
    conditions.push(eq(schema.reminderTable.isCompleted, true));
  } else if (status === 'upcoming') {
    conditions.push(eq(schema.reminderTable.isCompleted, false));
  }
  // No status param: return reminders of every completion state — this is
  // the generic list used by the reminder store (fleet or scoped), not just
  // the ad-hoc upcoming/completed split on the /reminders page.

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const reminders = await db
    .select({
      id: schema.reminderTable.id,
      vehicleId: schema.reminderTable.vehicleId,
      type: schema.reminderTable.type,
      note: schema.reminderTable.note,
      dueDate: schema.reminderTable.dueDate,
      isCompleted: schema.reminderTable.isCompleted,
      remindSchedule: schema.reminderTable.remindSchedule,
      recurrenceType: schema.reminderTable.recurrenceType,
      recurrenceInterval: schema.reminderTable.recurrenceInterval,
      recurrenceEndDate: schema.reminderTable.recurrenceEndDate,
      vehicleMake: schema.vehicleTable.make,
      vehicleModel: schema.vehicleTable.model,
      vehiclePlate: schema.vehicleTable.licensePlate
    })
    .from(schema.reminderTable)
    .leftJoin(schema.vehicleTable, eq(schema.reminderTable.vehicleId, schema.vehicleTable.id))
    .where(where)
    .orderBy(schema.reminderTable.dueDate);

  return json({ success: true, data: reminders });
};
