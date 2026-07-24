export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, context?: string, data?: Record<string, unknown>): void;
  info(message: string, context?: string, data?: Record<string, unknown>): void;
  warn(message: string, context?: string, data?: Record<string, unknown>): void;
  error(message: string, context?: string, data?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  debug(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('error', message, context, data);
  }

  private log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      data,
    };

    const prefix = `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}]`;
    const contextStr = context ? ` [${context}]` : '';
    const line = `${prefix}${contextStr} ${message}`;

    if (data) {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](line, data);
    } else {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](line);
    }
  }
}
