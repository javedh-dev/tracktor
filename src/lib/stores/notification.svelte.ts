import { goto } from '$app/navigation';
import type { Notification } from '$lib/domain/notification';
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification
} from '$lib/services/notification.service';
import { toast } from 'svelte-sonner';
import * as m from '$lib/paraglide/messages/_index.js';

type NotificationType = Notification['type'];

const NAVIGATION_MAP: Record<NotificationType, string> = {
  information: '/dashboard',
  insurance: '/insurance',
  pollution: '/pollution',
  reminder: '/reminders',
  maintenance: '/maintenance',
  registration: '/dashboard',
  alert: '/dashboard'
};

class NotificationStore {
  apiNotifications = $state<Notification[]>([]);
  isLoadingNotifications = $state(false);
  isClearingAll = $state(false);
  markingAsReadIds = $state<Record<string, boolean>>({});

  unreadCount = $derived(this.apiNotifications.filter((n) => !n.isRead).length);
  clearableReadCount = $derived(
    this.apiNotifications.filter((n) => n.isRead && n.channel !== 'alert').length
  );

  async fetch() {
    this.isLoadingNotifications = true;
    try {
      const response = await getAllNotifications();
      this.apiNotifications = response.status === 'OK' && response.data ? response.data : [];
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      this.apiNotifications = [];
    } finally {
      this.isLoadingNotifications = false;
    }
  }

  async markAsRead(notification: Notification) {
    if (notification.isRead) return;
    if (!notification.vehicleId || !notification.id) return;
    if (this.markingAsReadIds[notification.id]) return;
    this.markingAsReadIds = { ...this.markingAsReadIds, [notification.id]: true };
    try {
      const response = await markNotificationAsRead(notification.vehicleId, notification.id);
      if (response.status === 'OK') {
        this.apiNotifications = this.apiNotifications.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        );
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    } finally {
      const next = { ...this.markingAsReadIds };
      delete next[notification.id];
      this.markingAsReadIds = next;
    }
  }

  async navigate(notification: Notification) {
    const targetPath = NAVIGATION_MAP[notification.type];
    if (targetPath) await goto(targetPath);
  }

  async clearAllRead() {
    if (this.isClearingAll) return;
    const readNotifications = this.apiNotifications.filter(
      (n) => n.isRead && n.channel !== 'alert'
    );
    if (readNotifications.length === 0) return;
    this.isClearingAll = true;
    try {
      const results = await Promise.allSettled(
        readNotifications.map((n) => clearNotification(n.vehicleId, n.id!))
      );
      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failCount = results.filter((r) => r.status === 'rejected').length;
      const clearedIds = readNotifications
        .map((n) => n.id)
        .filter((_, i) => results[i].status === 'fulfilled');
      this.apiNotifications = this.apiNotifications.filter((n) => !clearedIds.includes(n.id));
      if (failCount === 0) {
        toast.success(
          successCount === 1
            ? m.notif_cleared_success_one()
            : m.notif_cleared_success_other({ count: String(successCount) })
        );
      } else if (successCount > 0) {
        toast.warning(
          m.notif_cleared_partial({ success: String(successCount), failed: String(failCount) })
        );
      } else {
        toast.error(m.notif_clear_failed());
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.notif_clear_failed());
    } finally {
      this.isClearingAll = false;
    }
  }

  async markAllAsRead() {
    if (this.unreadCount === 0 || this.isClearingAll) return;
    this.isClearingAll = true;
    try {
      const vehicleIds = Array.from(
        new Set(this.apiNotifications.filter((n) => !n.isRead).map((n) => n.vehicleId))
      );
      const results = await Promise.allSettled(
        vehicleIds.map((id) => markAllNotificationsAsRead(id))
      );
      const anySucceeded = results.some((r) => r.status === 'fulfilled' && r.value.status === 'OK');
      if (anySucceeded) {
        this.apiNotifications = this.apiNotifications.map((n) => ({ ...n, isRead: true }));
        toast.success(m.notif_all_marked_read());
      } else {
        toast.error(m.notif_mark_read_failed());
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.notif_mark_read_failed());
    } finally {
      this.isClearingAll = false;
    }
  }
}

export const notificationStore = new NotificationStore();
