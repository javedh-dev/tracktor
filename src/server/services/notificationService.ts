import type { ApiResponse } from '$lib';
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { eq } from 'drizzle-orm';
import type { NOTIFICATION_TYPES, NOTIFICATION_SOURCES } from '$lib/domain/notification';

export const getNotifications = async (vehicleId: string): Promise<ApiResponse> => {
	const notifications = await db.query.notificationTable.findMany({
		where: (n, { eq }) => eq(n.vehicleId, vehicleId),
		orderBy: (n, { desc }) => [desc(n.created_at)]
	});
	return {
		data: notifications,
		success: true
	};
};

export const createNotification = async (notificationData: {
	vehicleId: string;
	type: keyof typeof NOTIFICATION_TYPES;
	message: string;
	source: keyof typeof NOTIFICATION_SOURCES;
	dueDate: string;
	isRead?: number;
}): Promise<ApiResponse> => {
	const newNotification = await db
		.insert(schema.notificationTable)
		.values({
			type: notificationData.type,
			message: notificationData.message,
			source: notificationData.source,
			dueDate: notificationData.dueDate,
			isRead: notificationData.isRead ?? 0,
			vehicleId: notificationData.vehicleId
		})
		.returning();

	return {
		data: newNotification[0],
		success: true,
		message: 'Notification created successfully.'
	};
};

export const findExistingNotification = async (
	vehicleId: string,
	type: string,
	dueDate: string,
	source: string
) => {
	const notification = await db.query.notificationTable.findFirst({
		where: (n, { eq, and }) =>
			and(
				eq(n.vehicleId, vehicleId),
				eq(n.type, type),
				eq(n.dueDate, dueDate),
				eq(n.source, source)
			)
	});
	return notification ?? null;
};

export const deleteNotification = async (notificationId: string): Promise<ApiResponse> => {
	const deletedNotification = await db
		.delete(schema.notificationTable)
		.where(eq(schema.notificationTable.id, notificationId))
		.returning();

	if (deletedNotification.length === 0) {
		return {
			data: null,
			success: false,
			message: 'Notification not found.'
		};
	}

	return {
		data: deletedNotification[0],
		success: true,
		message: 'Notification deleted successfully.'
	};
};

export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse> => {
	const updatedNotification = await db
		.update(schema.notificationTable)
		.set({ isRead: 1 })
		.where(eq(schema.notificationTable.id, notificationId))
		.returning();

	if (updatedNotification.length === 0) {
		return {
			data: null,
			success: false,
			message: 'Notification not found.'
		};
	}

	return {
		data: updatedNotification[0],
		success: true,
		message: 'Notification marked as read.'
	};
};

export const markAllNotificationsAsRead = async (vehicleId: string): Promise<ApiResponse> => {
	const updatedNotifications = await db
		.update(schema.notificationTable)
		.set({ isRead: 1 })
		.where(eq(schema.notificationTable.vehicleId, vehicleId))
		.returning();

	return {
		data: updatedNotifications,
		success: true,
		message: 'All notifications marked as read.'
	};
};
