import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueTrends(months: number = 12, startDate?: string, endDate?: string) {
    const { start, end } = this.resolveRange(months, startDate, endDate);

    const rows: Array<{ month: Date; commissionRevenue: string; deliveryRevenue: string }> =
      await this.prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', o."createdAt") AS month,
          COALESCE(SUM(o."commission"), 0) AS "commissionRevenue",
          COALESCE(SUM(GREATEST(0, o."deliveryFee" - COALESCE(dp."deliveryFee"::numeric, 0))), 0) AS "deliveryRevenue"
        FROM "Order" o
        LEFT JOIN "Delivery" d ON d."orderId" = o.id
        LEFT JOIN "DriverProfile" dp ON dp."userId" = d."driverId"
        WHERE o.status = 'DELIVERED'
          AND o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
        GROUP BY DATE_TRUNC('month', o."createdAt")
        ORDER BY month ASC
      `;

    return rows.map((r) => ({
      month: this.formatMonth(r.month),
      commissionRevenue: Number(r.commissionRevenue),
      deliveryRevenue: Number(r.deliveryRevenue),
      totalRevenue: Number(r.commissionRevenue) + Number(r.deliveryRevenue),
    }));
  }

  async getOrderTrends(months: number = 12, startDate?: string, endDate?: string) {
    const { start, end } = this.resolveRange(months, startDate, endDate);

    const rows: Array<{ month: Date; count: bigint }> = await this.prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "createdAt") AS month,
        COUNT(*) AS count
      FROM "Order"
      WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
        AND status NOT IN ('DRAFT', 'CANCELLED', 'REFUNDED')
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return rows.map((r) => ({
      month: this.formatMonth(r.month),
      count: Number(r.count),
    }));
  }

  async getUserGrowth(months: number = 12, startDate?: string, endDate?: string) {
    const { start, end } = this.resolveRange(months, startDate, endDate);

    const rows: Array<{ month: Date; count: bigint }> = await this.prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "createdAt") AS month,
        COUNT(*) AS count
      FROM "User"
      WHERE role = 'CUSTOMER'
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
        AND "deletedAt" IS NULL
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return rows.map((r) => ({
      month: this.formatMonth(r.month),
      count: Number(r.count),
    }));
  }

  async getSellerGrowth(months: number = 12, startDate?: string, endDate?: string) {
    const { start, end } = this.resolveRange(months, startDate, endDate);

    const rows: Array<{ month: Date; count: bigint }> = await this.prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "createdAt") AS month,
        COUNT(*) AS count
      FROM "SellerProfile"
      WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return rows.map((r) => ({
      month: this.formatMonth(r.month),
      count: Number(r.count),
    }));
  }

  async getSummary(startDate?: string, endDate?: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let range: DateRange;

    if (startDate && endDate) {
      range = {
        startDate: new Date(startDate),
        endDate: new Date(endDate + 'T23:59:59.999Z'),
      };
    } else {
      range = { startDate: todayStart, endDate: now };
    }

    const defaultStartDate = new Date(0);
    const defaultEndDate = now;

    const revenueTotal = await this.revenueInRange(defaultStartDate, defaultEndDate);
    const revenuePeriod = await this.revenueInRange(range.startDate, range.endDate);

    const orderTotal = await this.orderCountInRange(defaultStartDate, defaultEndDate);
    const orderPeriod = await this.orderCountInRange(range.startDate, range.endDate);

    let userPeriod: number;
    let sellerPeriod: number;
    let userTotal: number;
    let sellerTotal: number;

    if (startDate && endDate) {
      userTotal = await this.userCountInRange(range.startDate, range.endDate);
      sellerTotal = await this.sellerCountInRange(range.startDate, range.endDate);
      userPeriod = userTotal;
      sellerPeriod = sellerTotal;
    } else {
      userTotal = await this.prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } });
      sellerTotal = await this.prisma.sellerProfile.count();
      userPeriod = await this.userCountInRange(monthStart, now);
      sellerPeriod = await this.sellerCountInRange(monthStart, now);
    }

    return {
      totalRevenue: Number(revenueTotal),
      periodRevenue: Number(revenuePeriod),
      totalOrders: Number(orderTotal),
      periodOrders: Number(orderPeriod),
      totalUsers: Number(userTotal),
      periodUsers: Number(userPeriod),
      totalSellers: Number(sellerTotal),
      periodSellers: Number(sellerPeriod),
    };
  }

  private async revenueInRange(start: Date, end: Date): Promise<string> {
    const result: Array<{ total: string }> = await this.prisma.$queryRaw`
      SELECT
        COALESCE(SUM(o."commission" + GREATEST(0, o."deliveryFee" - COALESCE(dp."deliveryFee"::numeric, 0))), 0) AS total
      FROM "Order" o
      LEFT JOIN "Delivery" d ON d."orderId" = o.id
      LEFT JOIN "DriverProfile" dp ON dp."userId" = d."driverId"
      WHERE o.status = 'DELIVERED'
        AND o."createdAt" >= ${start}
        AND o."createdAt" <= ${end}
    `;
    return result[0]?.total ?? '0';
  }

  private async orderCountInRange(start: Date, end: Date): Promise<number> {
    const result: Array<{ count: bigint }> = await this.prisma.$queryRaw`
      SELECT COUNT(*) AS count
      FROM "Order"
      WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
        AND status NOT IN ('DRAFT', 'CANCELLED', 'REFUNDED')
    `;
    return Number(result[0]?.count ?? 0);
  }

  private async userCountInRange(start: Date, end: Date): Promise<number> {
    const result: Array<{ count: bigint }> = await this.prisma.$queryRaw`
      SELECT COUNT(*) AS count
      FROM "User"
      WHERE role = 'CUSTOMER'
        AND "deletedAt" IS NULL
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
    `;
    return Number(result[0]?.count ?? 0);
  }

  private async sellerCountInRange(start: Date, end: Date): Promise<number> {
    const result: Array<{ count: bigint }> = await this.prisma.$queryRaw`
      SELECT COUNT(*) AS count
      FROM "SellerProfile"
      WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
    `;
    return Number(result[0]?.count ?? 0);
  }

  private resolveRange(
    months: number,
    startDate?: string,
    endDate?: string,
  ): { start: Date; end: Date } {
    if (startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    const start = new Date();
    start.setMonth(start.getMonth() - months);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    return { start, end: new Date() };
  }

  private formatMonth(date: Date): string {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
