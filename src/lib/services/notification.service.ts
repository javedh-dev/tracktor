import type { Notification } from '$lib/domain/notification';
import type { Response } from '$lib/domain/shared';
import { apiClient } from '$lib/helper/api.helper';

export const getNotifications = async (vehicleId: string): Promise<Response<Notification[]>> => {
  const res: Response<Notification[]> = { status: 'OK' };
  try {
    const response = await apiClient.get(`/vehicles/${vehicleId}/notifications`);
    // API returns { data: notifications[], success: true }
    res.data = response.data.data || response.data;
  } catch (e: any) {
    res.status = 'ERROR';
    res.error = e.response?.data?.message || 'Failed to fetch notifications.';
  }
  return res;
};

export const getAllNotifications = async (): Promise<Response<Notification[]>> => {
  const res: Response<Notification[]> = { status: 'OK' };
  try {
    const response = await apiClient.get('/notifications');
    res.data = response.data.data || response.data;
  } catch (e: any) {
    res.status = 'ERROR';
    res.error = e.response?.data?.message || 'Failed to fetch notifications.';
  }
  return res;
};

export const markNotificationAsRead = async (
  vehicleId: string,
  notificationId: string
): Promise<Response<Notification>> => {
  const res: Response<Notification> = { status: 'OK' };
  try {
    const response = await apiClient.patch(
      `/vehicles/${vehicleId}/notifications/${notificationId}`
    );
    res.data = response.data.data || response.data;
  } catch (e: any) {
    res.status = 'ERROR';
    res.error = e.response?.data?.message || 'Failed to mark notification as read.';
  }
  return res;
};

export const markAllNotificationsAsRead = async (
  vehicleId: string
): Promise<Response<Notification[]>> => {
  const res: Response<Notification[]> = { status: 'OK' };
  try {
    const response = await apiClient.put(`/vehicles/${vehicleId}/notifications`);
    res.data = response.data.data || response.data;
  } catch (e: any) {
    res.status = 'ERROR';
    res.error = e.response?.data?.message || 'Failed to mark all notifications as read.';
  }
  return res;
};

export const clearNotification = async (
  vehicleId: string,
  notificationId: string
): Promise<Response<Notification>> => {
  const res: Response<Notification> = { status: 'OK' };
  try {
    const response = await apiClient.delete(
      `/vehicles/${vehicleId}/notifications/${notificationId}`
    );
    res.data = response.data.data || response.data;
  } catch (e: any) {
    res.status = 'ERROR';
    res.error = e.response?.data?.message || 'Failed to clear notification.';
  }
  return res;
};
