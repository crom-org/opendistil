import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export class EventLogger {
  private logDir: string;
  private logFile: string;

  constructor(logDir?: string) {
    this.logDir = logDir ?? join(process.cwd(), ".opendistil", "logs");
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
    this.logFile = join(this.logDir, `opendistil-${new Date().toISOString().slice(0, 10)}.log`);
  }

  log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    const line = JSON.stringify(entry);
    appendFileSync(this.logFile, line + "\n", "utf-8");

    if (level === LogLevel.ERROR) {
      console.error(`[${level}] ${message}`, metadata ?? "");
    } else if (level === LogLevel.WARN) {
      console.warn(`[${level}] ${message}`, metadata ?? "");
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  getLogFile(): string {
    return this.logFile;
  }
}
