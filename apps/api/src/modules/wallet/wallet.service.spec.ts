import { Test, TestingModule } from '@nestjs/testing';
import { TransactionType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: jest.Mocked<PrismaService>;

  const mockWallet = {
    id: 'wallet-1',
    userId: 'user-1',
    balance: 0,
    pendingBalance: 0,
    availableBalance: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTx = {
    wallet: {
      findUnique: jest.fn().mockResolvedValue(mockWallet),
      create: jest.fn().mockResolvedValue(mockWallet),
      update: jest.fn().mockResolvedValue(mockWallet),
    },
    transaction: {
      create: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    },
  };

  const mockPrisma = {
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;

    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<any>) =>
      cb(mockTx),
    );
  });

  describe('getWallet', () => {
    it('should create wallet if not found', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);
      mockPrisma.wallet.create.mockResolvedValue(mockWallet);

      const result = await service.getWallet('user-1');

      expect(result.userId).toBe('user-1');
      expect(mockPrisma.wallet.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          balance: 0,
          pendingBalance: 0,
          availableBalance: 0,
        },
      });
    });

    it('should return existing wallet', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.getWallet('user-1');

      expect(result.userId).toBe('user-1');
      expect(mockPrisma.wallet.create).not.toHaveBeenCalled();
    });
  });

  describe('credit', () => {
    it('should credit wallet balance immediately', async () => {
      mockTx.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.credit(
        'user-1',
        100,
        TransactionType.WALLET_CREDIT,
        'MANUAL',
        'ref-1',
        'Test credit',
      );

      expect(mockTx.wallet.update).toHaveBeenCalled();
      expect(mockTx.transaction.create).toHaveBeenCalled();
      expect(result.balanceAfter).toBe(100);
    });

    it('should credit pending balance when settleImmediately is false', async () => {
      mockTx.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.credit(
        'user-1',
        100,
        TransactionType.SELLER_EARNING,
        'ORDER',
        'order-1',
        'Earnings',
        false,
      );

      expect(mockTx.wallet.update).toHaveBeenCalled();
      expect(mockTx.transaction.create).toHaveBeenCalled();
      expect(result.transactionId).toBe('tx-1');
    });

    it('should handle negative amount (debit via credit)', async () => {
      mockTx.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.credit(
        'user-1',
        -50,
        TransactionType.WALLET_DEBIT,
        'MANUAL',
        'ref-1',
        'Negative credit',
      );

      expect(result.balanceAfter).toBe(-50);
    });
  });

  describe('debit', () => {
    it('should debit wallet balance', async () => {
      mockTx.wallet.findUnique.mockResolvedValue({
        ...mockWallet,
        balance: 200,
        availableBalance: 200,
      });

      const result = await service.debit(
        'user-1',
        100,
        TransactionType.WALLET_DEBIT,
        'MANUAL',
        'ref-1',
        'Test debit',
      );

      expect(mockTx.wallet.update).toHaveBeenCalled();
      expect(mockTx.transaction.create).toHaveBeenCalled();
      expect(result.balanceAfter).toBe(100);
    });

    it('should throw for insufficient balance', async () => {
      mockTx.wallet.findUnique.mockResolvedValue(mockWallet);

      await expect(
        service.debit('user-1', 100, TransactionType.WALLET_DEBIT, 'MANUAL', 'ref-1', 'Test'),
      ).rejects.toThrow('Insufficient balance');
    });
  });

  describe('settlePending', () => {
    it('should move pending balance to available', async () => {
      mockTx.wallet.findUnique.mockResolvedValue({
        ...mockWallet,
        pendingBalance: 100,
        balance: 100,
      });

      const result = await service.settlePending('user-1', 100);

      expect(result.message).toBe('Pending balance settled');
      expect(mockTx.wallet.update).toHaveBeenCalled();
    });

    it('should throw for insufficient pending balance', async () => {
      mockTx.wallet.findUnique.mockResolvedValue(mockWallet);

      await expect(service.settlePending('user-1', 100)).rejects.toThrow(
        'Insufficient pending balance',
      );
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrisma.transaction.findMany.mockResolvedValue([
        {
          id: 'tx-1',
          walletId: 'wallet-1',
          amount: 100,
          type: TransactionType.WALLET_CREDIT,
          createdAt: new Date(),
        },
      ]);
      mockPrisma.transaction.count.mockResolvedValue(1);

      const result = await service.getTransactions('user-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(1);
    });
  });
});
