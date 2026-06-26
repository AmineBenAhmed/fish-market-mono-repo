import { api, unwrap, unwrapPaginated } from './api';
import type { WalletInfo, Transaction } from '../types';

export const walletService = {
  async getWallet(): Promise<WalletInfo> {
    const { data } = await api.get('/wallet');
    return unwrap<WalletInfo>(data);
  },

  async getTransactions(params?: { page?: number; limit?: number }) {
    const { data } = await api.get('/wallet/transactions', { params });
    return unwrapPaginated<Transaction>(data);
  },
};
