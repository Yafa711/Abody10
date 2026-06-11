import { Alert } from 'react-native';

export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorRecord {
  id: string;
  message: string;
  level: ErrorLevel;
  context?: string;
  timestamp: number;
  stack?: string;
}

class ErrorService {
  private errors: ErrorRecord[] = [];
  private maxErrors = 100;
  private listeners: Array<(error: ErrorRecord) => void> = [];

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  capture(error: unknown, level: ErrorLevel = 'error', context?: string) {
    const message = error instanceof Error ? error.message : String(error || 'Unknown error');
    const record: ErrorRecord = {
      id: this.generateId(),
      message,
      level,
      context,
      timestamp: Date.now(),
      stack: error instanceof Error ? error.stack : undefined,
    };
    this.errors.unshift(record);
    if (this.errors.length > this.maxErrors) this.errors.pop();
    this.listeners.forEach(fn => fn(record));
  }

  log(error: unknown, context?: string) {
    this.capture(error, 'info', context);
  }

  warn(error: unknown, context?: string) {
    this.capture(error, 'warning', context);
  }

  critical(error: unknown, context?: string) {
    this.capture(error, 'critical', context);
  }

  getErrors(): ErrorRecord[] {
    return [...this.errors];
  }

  clear() {
    this.errors = [];
  }

  subscribe(listener: (error: ErrorRecord) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  showUserError(error: unknown, title = 'خطأ') {
    const message = error instanceof Error ? error.message : String(error || 'حدث خطأ غير متوقع');
    this.capture(error, 'error');
    Alert.alert(title, message);
  }
}

export const errorService = new ErrorService();

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorService.capture(error, 'error', context);
      throw error;
    }
  };
}
