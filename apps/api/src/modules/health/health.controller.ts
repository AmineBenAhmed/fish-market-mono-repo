import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';

import { createSuccessResponse } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

class HealthStatus {
  status!: 'ok' | 'error';
  uptime!: number;
  timestamp!: string;
  services!: {
    database: { status: string };
    redis: { status: string };
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly prisma: PrismaClient;
  private readonly startTime: number;

  constructor(
    prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {
    this.prisma = prismaService;
    this.startTime = Date.now();
  }

  @Get()
  @ApiOperation({ summary: 'Check API health' })
  @ApiOkResponse({ type: HealthStatus })
  async check(): Promise<unknown> {
    const [dbOk, redisOk] = await Promise.all([this.checkDatabase(), this.redisService.ping()]);

    const allOk = dbOk && redisOk;

    return createSuccessResponse(
      {
        status: allOk ? 'ok' : 'error',
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        timestamp: new Date().toISOString(),
        services: {
          database: { status: dbOk ? 'up' : 'down' },
          redis: { status: redisOk ? 'up' : 'down' },
        },
      },
      undefined,
      '/api/v1/health',
    );
  }

  @Get('database')
  @ApiOperation({ summary: 'Check database health' })
  async checkDatabaseHealth(): Promise<unknown> {
    const ok = await this.checkDatabase();
    return createSuccessResponse(
      { status: ok ? 'up' : 'down' },
      undefined,
      '/api/v1/health/database',
    );
  }

  @Get('redis')
  @ApiOperation({ summary: 'Check Redis health' })
  async checkRedisHealth(): Promise<unknown> {
    const ok = await this.redisService.ping();
    return createSuccessResponse({ status: ok ? 'up' : 'down' }, undefined, '/api/v1/health/redis');
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
