import fs from 'fs';
import path from 'path';

const logDir = path.resolve(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'test-run.log');

type Level = 'INFO' | 'WARN' | 'ERROR';

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export function createLogger(testName: string): Logger {
  fs.mkdirSync(logDir, { recursive: true });

  const write = (level: Level, message: string) => {
    const line = `${new Date().toISOString()} [${level}] [${testName}] ${message}`;
    (level === 'ERROR' ? console.error : console.log)(line);
    fs.appendFileSync(logFile, `${line}\n`);
  };

  return {
    info: (message) => write('INFO', message),
    warn: (message) => write('WARN', message),
    error: (message) => write('ERROR', message),
  };
}
