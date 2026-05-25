import { Queue } from "bullmq";
import { getConnectionOptions, RedisConfig } from "./client";
import type { NotificationJobData } from "./types";

const QUEUE = "notification";

let queue: Queue<NotificationJobData> | null = null;

export function getNotificationQueue(config?: Partial<RedisConfig>): Queue<NotificationJobData> {
  if (!queue) {
    queue = new Queue<NotificationJobData>(QUEUE, {
      connection: getConnectionOptions(config),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 7 * 24 * 3600, count: 1000 },
        removeOnFail: { age: 30 * 24 * 3600 },
      },
    });
  }
  return queue;
}

export async function sendNotificationJob(data: NotificationJobData) {
  const q = getNotificationQueue();
  return q.add("send-notification", data);
}
