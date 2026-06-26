import type { Notification } from '../types';
import { api, unwrapPaginated } from './api';

export const notificationsService = {
  async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: string }) {
    const result = await api.get('/notifications', { params });
    return unwrapPaginated<Notification>(result);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get('/notifications/unread-count');
    return data.data.unreadCount;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
