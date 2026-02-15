import type { ApiResponse } from '$lib';
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { eq } from 'drizzle-orm';

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
