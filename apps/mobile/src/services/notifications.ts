import { api, unwrap, unwrapPaginated } from './api';
import type { NotificationItem } from '../types';

export const notificationsService = {
  list: async (params?: { limit?: number; unreadOnly?: boolean }) => {
    const res = await api.get('/notifications', { params });
    return unwrapPaginated<NotificationItem>(res);
  },

  markRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return unwrap<NotificationItem>(res);
  },

  markAllRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return unwrap<{ count: number }>(res);
  },

  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return unwrap<{ count: number }>(res);
  },
};
