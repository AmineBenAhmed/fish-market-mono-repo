import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';

interface TransactionFilters {
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async ensureWallet(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    let wallet = await client.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await client.wallet.create({
        data: {
          userId,
          balance: 0,
          pendingBalance: 0,
          availableBalance: 0,
        },
      });
    }
    return wallet;
  }

  async getWallet(userId: string) {
    const wallet = await this.ensureWallet(userId);
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      availableBalance: wallet.availableBalance,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async getTransactions(userId: string, filters: TransactionFilters) {
    const wallet = await this.ensureWallet(userId);

    const where: Prisma.TransactionWhereInput = { walletId: wallet.id };

    if (filters.type) {
      where.type = filters.type as TransactionType;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const { page, limit, skip } = parsePagination(filters.page, filters.limit);

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async credit(
    userId: string,
    amount: number,
    type: TransactionType,
    referenceType: string,
    referenceId: string,
    description: string,
    settleImmediately = true,
  ): Promise<Record<string, unknown>> {
    const result = await this.prisma.$transaction(async (tx) => {
      const wallet = await this.ensureWallet(userId, tx);

      const balance = Number(wallet.balance);
      const pending = Number(wallet.pendingBalance);
      const available = Number(wallet.availableBalance);

      let newBalance = balance;
      let newPending = pending;
      let newAvailable = available;

      if (settleImmediately) {
        newBalance = balance + amount;
        newAvailable = available + amount;
      } else {
        newPending = pending + amount;
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          pendingBalance: newPending,
          availableBalance: newAvailable,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          referenceType,
          referenceId,
          description,
          balanceBefore: balance,
          balanceAfter: newBalance,
        },
      });

      return {
        walletId: wallet.id,
        transactionId: transaction.id,
        balanceBefore: balance,
        balanceAfter: newBalance,
      };
    });

    return result;
  }

  async debit(
    userId: string,
    amount: number,
    type: TransactionType,
    referenceType: string,
    referenceId: string,
    description: string,
  ): Promise<Record<string, unknown>> {
    const result = await this.prisma.$transaction(async (tx) => {
      const wallet = await this.ensureWallet(userId, tx);

      const balance = Number(wallet.balance);
      const available = Number(wallet.availableBalance);

      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      const newBalance = balance - amount;
      const newAvailable = available - amount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          availableBalance: newAvailable,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount: -amount,
          referenceType,
          referenceId,
          description,
          balanceBefore: balance,
          balanceAfter: newBalance,
        },
      });

      return {
        walletId: wallet.id,
        transactionId: transaction.id,
        balanceBefore: balance,
        balanceAfter: newBalance,
      };
    });

    return result;
  }

  async settlePending(userId: string, amount: number): Promise<Record<string, unknown>> {
    const result = await this.prisma.$transaction(async (tx) => {
      const wallet = await this.ensureWallet(userId, tx);

      const pending = Number(wallet.pendingBalance);
      const balance = Number(wallet.balance);
      const available = Number(wallet.availableBalance);

      if (pending < amount) {
        throw new Error('Insufficient pending balance');
      }

      const newPending = pending - amount;
      const newBalance = balance + amount;
      const newAvailable = available + amount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingBalance: newPending,
          balance: newBalance,
          availableBalance: newAvailable,
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.DEPOSIT,
          amount,
          referenceType: 'SETTLEMENT',
          referenceId: wallet.id,
          description: `Settled ${amount} from pending to balance`,
          balanceBefore: balance,
          balanceAfter: newBalance,
        },
      });

      return { message: 'Pending balance settled', amount };
    });

    return result;
  }
}
