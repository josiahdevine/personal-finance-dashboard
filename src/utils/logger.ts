enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Format log message
   */
  private formatMessage(level: string, component: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${component}] ${message}`;
  }

  /**
   * Debug level logging
   */
  debug(component: string, message: string, ...data: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', component, message), ...data);
    }
  }

  /**
   * Info level logging
   */
  info(component: string, message: string, ...data: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.formatMessage('INFO', component, message), ...data);
    }
  }

  /**
   * Warning level logging
   */
  warn(component: string, message: string, ...data: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', component, message), ...data);
    }
  }

  /**
   * Error level logging
   */
  error(component: string, message: string, error?: Error, ...data: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      const errorObj = error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined;
      
      console.error(
        this.formatMessage('ERROR', component, message),
        errorObj,
        ...data
      );
      
      // In production, send errors to a monitoring service
      if (this.isProduction && window.Sentry) {
        try {
          if (error) {
            window.Sentry.captureException(error);
          } else {
            window.Sentry.captureMessage(message, {
              level: 'error',
              tags: { component },
              extra: { data }
            });
          }
        } catch (e) {
          // Do nothing if Sentry fails
          console.error('Failed to send error to Sentry', e);
        }
      }
    }
  }

  /**
   * Log API request
   */
  logRequest(method: string, url: string, data?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      this.debug('API', `Request: ${method} ${url}`, data);
    }
  }

  /**
   * Log API response
   */
  logResponse(method: string, url: string, status: number, data?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      this.debug('API', `Response: ${method} ${url} (${status})`, data);
    }
  }

  /**
   * Log component render
   */
  logRender(component: string, props?: Record<string, any>): void {
    if (this.level <= LogLevel.DEBUG) {
      this.debug('Render', `Rendering ${component}`, props);
    }
  }

  /**
   * Generic log method (for backward compatibility)
   */
  log(component: string, message: string, data?: any): void {
    this.info(component, message, data);
  }

  /**
   * Generic error log method (for backward compatibility)
   */
  logError(component: string, message: string, error?: Error, additionalData?: any): void {
    this.error(component, message, error, additionalData);
  }
}

// Create singleton logger instance
const logger = new Logger();

// Add Sentry types for TypeScript
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error) => void;
      captureMessage: (message: string, options: any) => void;
    };
  }
}

export default logger; 