import { api, unwrap, unwrapPaginated } from './api';
import type { WalletInfo, WalletTransaction } from '../types';

export const walletService = {
  getWallet: async () => {
    const res = await api.get('/wallet');
    return unwrap<WalletInfo>(res);
  },

  getTransactions: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get('/wallet/transactions', { params });
    return unwrapPaginated<WalletTransaction>(res);
  },
};
