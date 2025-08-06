import { API_BASE_URL } from '@/config';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  error?: string;
}

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

class ApiService {
  private baseUrl = API_BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
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

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData = {};
        
        try {
          errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // If all else fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
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
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
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