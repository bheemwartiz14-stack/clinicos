import Redis from "ioredis";
import type { ConnectionOptions } from "bullmq";

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export function getRedisConfig(): RedisConfig {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
  };
}

export function getConnectionOptions(config?: Partial<RedisConfig>): ConnectionOptions {
  const { host, port, password, db } = { ...getRedisConfig(), ...config };
  return { host, port, password, db, maxRetriesPerRequest: null };
}

export function createRedisConnection(config?: Partial<RedisConfig>): Redis {
  const { host, port, password, db } = { ...getRedisConfig(), ...config };
  return new Redis({
    host,
    port,
    password,
    db,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      if (times > 10) return null;
      return Math.min(times * 200, 5000);
    },
  });
}

let sharedConnection: Redis | null = null;

export function getSharedConnection(): Redis {
  if (!sharedConnection) {
    sharedConnection = createRedisConnection();
  }
  return sharedConnection;
}
