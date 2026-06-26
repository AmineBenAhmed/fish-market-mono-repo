import type { Payment } from '../types';
import { api, unwrapPaginated } from './api';

export const paymentsService = {
  async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const result = await api.get('/admin/payments', { params });
    return unwrapPaginated<Payment>(result);
  },
};
