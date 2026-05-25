export {
  getRedisConfig,
  getConnectionOptions,
  createRedisConnection,
  getSharedConnection,
} from "./client";
export type { RedisConfig } from "./client";

export { getEmailQueue, sendEmailJob } from "./email.queue";
export { getNotificationQueue, sendNotificationJob } from "./notification.queue";

export { createEmailWorker } from "./email.worker";

export type { EmailJobData, NotificationJobData, NotificationChannel, JobDataMap } from "./types";
