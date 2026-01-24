import { API_BASE_URL, API_CONFIG } from '@/config';
import { logger } from './logger';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  error?: string;
}

type ApiErrorBody = {
  detail?: string;
  message?: string;
  [key: string]: unknown;
};

// Retry configuration
const MAX_RETRIES = API_CONFIG.RETRY_ATTEMPTS || 3;
const RETRY_DELAY = API_CONFIG.RETRY_DELAY || 1000;
const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT || 30000;

function mergeHeaders(base: Record<string, string>, extra?: HeadersInit): Record<string, string> {
  const result: Record<string, string> = { ...base };
  if (extra) {
    if (Array.isArray(extra)) {
      for (const [k, v] of extra) result[k] = v;
    } else if (typeof extra === 'object') {
      Object.assign(result, extra);
    }
    // If it's a Headers object, convert to plain object
    if (typeof Headers !== 'undefined' && extra instanceof Headers) {
      extra.forEach((v, k) => { result[k] = v; });
    }
  }
  return result;
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(status: number): boolean {
  // Retry on network errors, timeouts, and 5xx server errors
  return status === 0 || status === 408 || (status >= 500 && status < 600);
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeoutMs: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
}

class ApiService {
  private baseUrl = API_BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null,
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = mergeHeaders({ 'Content-Type': 'application/json' }, options.headers);

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      config.credentials = undefined;
    } else {
      config.credentials = 'include'; // Use cookies
    }

    // Add timeout
    const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT);
    config.signal = controller.signal;

    try {
      logger.addBreadcrumb(`API Request: ${options.method || 'GET'} ${endpoint}`, 'api');
      
      const response = await fetch(url, config);
      
      // Clear timeout on successful response
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData: ApiErrorBody = {};
        
        try {
          errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {
            // If all else fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        
        // Retry logic for retryable errors
        if (isRetryableError(response.status) && retryCount < MAX_RETRIES) {
          logger.warn(`API request failed, retrying (${retryCount + 1}/${MAX_RETRIES})`, {
            endpoint,
            status: response.status,
          });
          
          await delay(RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
          return this.request<T>(endpoint, options, token, retryCount + 1);
        }
        
        throw new ApiError({
          message: errorMessage,
          status: response.status,
          details: errorData,
        });
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        logger.addBreadcrumb(`API Response: ${endpoint}`, 'api', { status: response.status });
        return data;
      }
      
      return {} as T;
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        logger.error('API Error', error, { endpoint, status: error.status });
        throw error;
      }
      
      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('API Request Timeout', error, { endpoint, timeout: REQUEST_TIMEOUT });
        
        // Retry on timeout
        if (retryCount < MAX_RETRIES) {
          logger.warn(`API request timeout, retrying (${retryCount + 1}/${MAX_RETRIES})`, {
            endpoint,
          });
          
          await delay(RETRY_DELAY * Math.pow(2, retryCount));
          return this.request<T>(endpoint, options, token, retryCount + 1);
        }
        
        throw new ApiError({
          message: 'Request timeout. Please check your network connection and try again.',
          status: 408,
          details: { timeout: REQUEST_TIMEOUT },
        });
      }
      
      // Handle network errors
      const isNetworkError = error instanceof Error && (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
      );
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        logger.warn(`Network error, retrying (${retryCount + 1}/${MAX_RETRIES})`, {
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        await delay(RETRY_DELAY * Math.pow(2, retryCount));
        return this.request<T>(endpoint, options, token, retryCount + 1);
      }
      
      logger.error('API Network Error', error, { endpoint });
      throw new ApiError({
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
        details: error,
      });
    }
  }

  // GET requests
  async get<T>(endpoint: string, token?: string | null): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  // POST requests
  async post<T>(endpoint: string, data: unknown, token?: string | null): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  // PUT requests
  async put<T>(endpoint: string, data: unknown, token?: string | null): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  // DELETE requests
  async delete<T>(endpoint: string, token?: string | null): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token);
  }

  // PATCH requests
  async patch<T>(endpoint: string, data: unknown, token?: string | null): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  }

  // Query parameters helper
  buildQuery(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // GET with query parameters
  async getWithQuery<T>(endpoint: string, params: Record<string, unknown>, token?: string | null): Promise<T> {
    const query = this.buildQuery(params);
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.get<T>(url, token);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export { ApiService };

// Custom error class
export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor({ message, status, details }: { message: string; status: number; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
} 