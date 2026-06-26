import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis;
  private readonly defaultTtl = 60_000;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Cache Redis error: ${err.message}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlMs ?? this.defaultTtl > 0) {
        await this.client.setex(key, (ttlMs ?? this.defaultTtl) / 1000, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      this.logger.warn(`Cache set failed: ${key} - ${(err as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // ignore
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const stream = this.client.scanStream({ match: pattern, count: 100 });
      for await (const keys of stream) {
        if (keys.length > 0) await this.client.del(...keys);
      }
    } catch (err) {
      this.logger.warn(`Cache delPattern failed: ${pattern} - ${(err as Error).message}`);
    }
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttlMs);
    return value;
  }
}
