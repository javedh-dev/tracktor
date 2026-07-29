import { goto } from '$app/navigation';
import { vehicleStore } from '$stores/vehicle.svelte';
import type { Notification } from '$lib/domain/notification';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification
} from '$lib/services/notification.service';
import { toast } from 'svelte-sonner';
import * as m from '$lib/paraglide/messages/_index.js';

type NotificationType = Notification['type'];

export const NAVIGATION_MAP: Record<NotificationType, string> = {
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

  async fetch(vehicleId: string) {
    this.isLoadingNotifications = true;
    try {
      const response = await getNotifications(vehicleId);
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
    if (!vehicleStore.selectedId || !notification.id) return;
    if (this.markingAsReadIds[notification.id]) return;
    this.markingAsReadIds = { ...this.markingAsReadIds, [notification.id]: true };
    try {
      const response = await markNotificationAsRead(vehicleStore.selectedId, notification.id);
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
    if (!vehicleStore.selectedId || this.isClearingAll) return;
    const readNotifications = this.apiNotifications.filter(
      (n) => n.isRead && n.channel !== 'alert'
    );
    if (readNotifications.length === 0) return;
    this.isClearingAll = true;
    try {
      const results = await Promise.allSettled(
        readNotifications.map((n) => clearNotification(vehicleStore.selectedId!, n.id!))
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
    if (!vehicleStore.selectedId || this.unreadCount === 0 || this.isClearingAll) return;
    this.isClearingAll = true;
    try {
      const response = await markAllNotificationsAsRead(vehicleStore.selectedId);
      if (response.status === 'OK') {
        this.apiNotifications = this.apiNotifications.map((n) => ({ ...n, isRead: true }));
        toast.success(m.notif_all_marked_read());
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.notif_mark_read_failed());
    } finally {
      this.isClearingAll = false;
    }
  }
}

export const notificationStore = new NotificationStore();
