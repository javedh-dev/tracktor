import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db/index';
import * as schema from '$server/db/schema/index';
import { eq, and, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');

  const conditions = [];

  if (type && type !== 'all') {
    conditions.push(eq(schema.reminderTable.type, type));
  }
  if (status === 'completed') {
    conditions.push(eq(schema.reminderTable.isCompleted, true));
  } else if (status === 'upcoming') {
    conditions.push(eq(schema.reminderTable.isCompleted, false));
  } else {
    conditions.push(eq(schema.reminderTable.isCompleted, false));
  }

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
