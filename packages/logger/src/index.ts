import { mkdirSync } from "node:fs";
import { join } from "node:path";
import winston from "winston";

export type LogMeta = Record<string, unknown>;

const sensitiveKeyPattern = /password|secret|token|authorization|cookie|api[_-]?key/i;

function redact(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    };
  }

  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[redacted]" : redact(entry)
    ])
  );
}

function serializeMeta(meta: LogMeta) {
  const cleanMeta = redact(meta);
  return Object.keys(cleanMeta as LogMeta).length > 0 ? ` ${JSON.stringify(cleanMeta)}` : "";
}

const consoleFormat = winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
  const renderedMessage = stack ?? message;
  return `${timestamp} ${level}: ${renderedMessage}${serializeMeta(meta)}`;
});

function getDateLogFileName(date = new Date()) {
  return `${date.toISOString().slice(0, 10)}.log`;
}

function createDateFileTransport() {
  const logDir = process.env.LOG_DIR ?? join(process.cwd(), "logs");

  try {
    mkdirSync(logDir, { recursive: true });

    return new winston.transports.File({
      filename: join(logDir, getDateLogFileName()),
      level: process.env.FILE_LOG_LEVEL ?? process.env.LOG_LEVEL
    });
  } catch {
    return null;
  }
}

const fileTransport = createDateFileTransport();

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  defaultMeta: {
    app: "clinicos"
  },
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    consoleFormat
  ),
  transports: [
    new winston.transports.Console(),
    ...(fileTransport ? [fileTransport] : [])
  ]
});

export function createScopedLogger(scope: string) {
  return logger.child({ scope });
}
