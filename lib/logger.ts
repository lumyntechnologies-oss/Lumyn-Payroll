import { v4 as uuid } from 'uuid';

interface LogEntry {
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context?: Record<string, any>;
  traceId: string;
  timestamp: string;
  service?: string;
}

export class StructuredLogger {
  static createTraceId(): string {
    return uuid();
  }

  static info(message: string, context: Record<string, any> = {}, service = 'app') {
    const log: LogEntry = {
      level: 'INFO',
      message,
      context,
      traceId: this.createTraceId(),
      timestamp: new Date().toISOString(),
      service,
    };
    console.log(JSON.stringify(log));
    // Sentry.captureMessage(message, 'info', { extra: context, tags: { service } });
  }

  static warn(message: string, context: Record<string, any> = {}, service = 'app') {
    const log: LogEntry = {
      level: 'WARN',
      message,
      context,
      traceId: this.createTraceId(),
      timestamp: new Date().toISOString(),
      service,
    };
    console.warn(JSON.stringify(log));
    // Sentry.captureMessage(message, 'warning', { extra: context, tags: { service } });
  }

  static error(message: string, error?: Error, context: Record<string, any> = {}, service = 'app') {
    const log: LogEntry = {
      level: 'ERROR',
      message,
      context: { ...context, error: error?.message, stack: error?.stack },
      traceId: this.createTraceId(),
      timestamp: new Date().toISOString(),
      service,
    };
    console.error(JSON.stringify(log));
    // Sentry.captureException(error || new Error(message), { extra: context, tags: { service } });
  }
}

export const logger = StructuredLogger;

