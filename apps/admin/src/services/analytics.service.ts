import { api, unwrap } from './api';

export interface AnalyticsTrendPoint {
  month: string;
  count?: number;
  commissionRevenue?: number;
  deliveryRevenue?: number;
  totalRevenue?: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  periodRevenue: number;
  totalOrders: number;
  periodOrders: number;
  totalUsers: number;
  periodUsers: number;
  totalSellers: number;
  periodSellers: number;
}

interface DateParams {
  startDate?: string;
  endDate?: string;
}

export const analyticsService = {
  async getRevenueTrends(months = 12, dates?: DateParams): Promise<AnalyticsTrendPoint[]> {
    const result = await api.get('/admin/analytics/revenue-trends', {
      params: { months, ...dates },
    });
    return unwrap<AnalyticsTrendPoint[]>(result);
  },

  async getOrderTrends(months = 12, dates?: DateParams): Promise<AnalyticsTrendPoint[]> {
    const result = await api.get('/admin/analytics/order-trends', {
      params: { months, ...dates },
    });
    return unwrap<AnalyticsTrendPoint[]>(result);
  },

  async getUserGrowth(months = 12, dates?: DateParams): Promise<AnalyticsTrendPoint[]> {
    const result = await api.get('/admin/analytics/user-growth', {
      params: { months, ...dates },
    });
    return unwrap<AnalyticsTrendPoint[]>(result);
  },

  async getSellerGrowth(months = 12, dates?: DateParams): Promise<AnalyticsTrendPoint[]> {
    const result = await api.get('/admin/analytics/seller-growth', {
      params: { months, ...dates },
    });
    return unwrap<AnalyticsTrendPoint[]>(result);
  },

  async getSummary(dates?: DateParams): Promise<AnalyticsSummary> {
    const result = await api.get('/admin/analytics/summary', {
      params: { ...dates },
    });
    return unwrap<AnalyticsSummary>(result);
  },
};
