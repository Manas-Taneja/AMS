/**
 * Logger Service
 * 
 * Provides environment-aware logging that uses console in development
 * and Sentry in production for error tracking.
 */

import * as Sentry from '@sentry/nextjs';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (IS_DEVELOPMENT) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
    // In production, debug logs are not sent to Sentry
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (IS_DEVELOPMENT) {
      console.log(`[INFO] ${message}`, context || '');
    } else if (IS_PRODUCTION) {
      Sentry.captureMessage(message, {
        level: 'info',
        extra: context,
      });
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (IS_DEVELOPMENT) {
      console.warn(`[WARN] ${message}`, context || '');
    } else if (IS_PRODUCTION) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (IS_DEVELOPMENT) {
      console.error(`[ERROR] ${message}`, error || '', context || '');
    }
    
    if (IS_PRODUCTION) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: {
            message,
            ...context,
          },
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: {
            error,
            ...context,
          },
        });
      }
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string | number; email?: string; username?: string } | null): void {
    if (IS_PRODUCTION) {
      if (user) {
        Sentry.setUser({
          id: String(user.id),
          email: user.email,
          username: user.username,
        });
      } else {
        Sentry.setUser(null);
      }
    }
  }

  /**
   * Add breadcrumb for debugging context
   */
  addBreadcrumb(message: string, category?: string, data?: LogContext): void {
    if (IS_DEVELOPMENT) {
      console.log(`[BREADCRUMB] ${category || 'general'}: ${message}`, data || '');
    }
    
    if (IS_PRODUCTION) {
      Sentry.addBreadcrumb({
        message,
        category: category || 'general',
        data,
        level: 'info',
      });
    }
  }

  /**
   * Set additional context for errors
   */
  setContext(key: string, context: LogContext): void {
    if (IS_PRODUCTION) {
      Sentry.setContext(key, context);
    }
  }

  /**
   * Set a tag for filtering/grouping errors
   */
  setTag(key: string, value: string): void {
    if (IS_PRODUCTION) {
      Sentry.setTag(key, value);
    }
  }

  /**
   * Capture an exception directly
   */
  captureException(error: Error, context?: LogContext): void {
    if (IS_DEVELOPMENT) {
      console.error('[EXCEPTION]', error, context || '');
    }
    
    if (IS_PRODUCTION) {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, operation: string): unknown {
    if (IS_PRODUCTION) {
      return Sentry.startSpan({
        name,
        op: operation,
      }, (span) => span);
    }
    
    // Return a no-op object in development
    return {
      finish: () => {},
      setStatus: () => {},
      setData: () => {},
    };
  }

  /**
   * Track API call performance
   */
  async trackApiCall<T>(
    endpoint: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const transaction = this.startTransaction(endpoint, 'http.client');
    
    try {
      const result = await operation();
      if (transaction && typeof transaction === 'object' && 'setStatus' in transaction) {
        (transaction as { setStatus: (status: string) => void }).setStatus('ok');
      }
      return result;
    } catch (error) {
      if (transaction && typeof transaction === 'object' && 'setStatus' in transaction) {
        (transaction as { setStatus: (status: string) => void }).setStatus('error');
      }
      this.error(`API call failed: ${endpoint}`, error as Error);
      throw error;
    } finally {
      if (transaction && typeof transaction === 'object' && 'finish' in transaction) {
        (transaction as { finish: () => void }).finish();
      }
    }
  }

  /**
   * Wrap a function with error boundary
   */
  wrapErrorBoundary<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context?: LogContext
  ): T {
    return ((...args: unknown[]) => {
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((error) => {
            this.error(`Error in ${fn.name || 'anonymous function'}`, error, context);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        this.error(`Error in ${fn.name || 'anonymous function'}`, error, context);
        throw error;
      }
    }) as T;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export the class for testing
export { Logger };

// Convenience exports
export default logger;
