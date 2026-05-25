import { Queue } from "bullmq";
import { getConnectionOptions, RedisConfig } from "./client";
import type { EmailJobData } from "./types";

const QUEUE = "email";

let queue: Queue<EmailJobData> | null = null;

export function getEmailQueue(config?: Partial<RedisConfig>): Queue<EmailJobData> {
  if (!queue) {
    queue = new Queue<EmailJobData>(QUEUE, {
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

export async function sendEmailJob(data: EmailJobData) {
  const q = getEmailQueue();
  return q.add("send-email", data);
}
