import { api, unwrap } from './api';

export interface DeliveryPricing {
  id: string;
  fromAreaId: string;
  toAreaId: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export const deliveryPricingService = {
  async findAll(): Promise<DeliveryPricing[]> {
    const result = await api.get('/admin/delivery-pricing');
    return unwrap<DeliveryPricing[]>(result);
  },

  async create(data: {
    fromAreaId: string;
    toAreaId: string;
    price: number;
  }): Promise<DeliveryPricing> {
    const result = await api.post('/admin/delivery-pricing', data);
    return unwrap<DeliveryPricing>(result);
  },

  async update(
    id: string,
    data: { fromAreaId?: string; toAreaId?: string; price?: number },
  ): Promise<DeliveryPricing> {
    const result = await api.patch(`/admin/delivery-pricing/${id}`, data);
    return unwrap<DeliveryPricing>(result);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/admin/delivery-pricing/${id}`);
  },
};
