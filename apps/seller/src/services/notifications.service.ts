import { api, unwrapPaginated } from './api';
import type { Notification } from '../types';

export const notificationsService = {
  async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: string }) {
    const { data } = await api.get('/notifications', { params });
    return unwrapPaginated<Notification>(data);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get('/notifications/unread-count');
    return data.data?.unreadCount ?? 0;
  },

  async markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await api.patch('/notifications/read-all');
  },
};
