import { Worker } from "bullmq";
import { getConnectionOptions, RedisConfig } from "./client";
import type { EmailJobData } from "./types";

export function createEmailWorker(
  processor: (job: { data: EmailJobData }) => Promise<void>,
  config?: Partial<RedisConfig>,
) {
  const worker = new Worker<EmailJobData>(
    "email",
    async (job) => {
      await processor(job);
    },
    {
      connection: getConnectionOptions(config),
      concurrency: 10,
      lockDuration: 60000,
    },
  );

  worker.on("completed", (job) => {
    job.log(`Email sent to ${job.data.to}`);
  });

  worker.on("failed", (job, err) => {
    job?.log(`Email to ${job?.data.to} failed: ${err.message}`);
  });

  return worker;
}
