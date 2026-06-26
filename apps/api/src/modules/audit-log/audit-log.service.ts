import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    entity: string;
    entityId: string;
    action: string;
    userId: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        entity: params.entity,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId,
        oldValue: (params.oldValue ?? {}) as Prisma.InputJsonValue,
        newValue: (params.newValue ?? {}) as Prisma.InputJsonValue,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  async findMany(params: {
    entity?: string;
    entityId?: string;
    action?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (params.entity) where.entity = params.entity;
    if (params.entityId) where.entityId = params.entityId;
    if (params.action) where.action = params.action;
    if (params.userId) where.userId = params.userId;

    const { page, limit, skip } = parsePagination(params.page, params.limit);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }
}
