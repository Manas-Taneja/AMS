export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

class ApiService {
  private baseUrl = API_BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({
          message: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
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
  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  // POST requests
  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  // PUT requests
  async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  // DELETE requests
  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token);
  }

  // PATCH requests
  async patch<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  }

  // Query parameters helper
  buildQuery(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // GET with query parameters
  async getWithQuery<T>(endpoint: string, params: Record<string, any>, token?: string): Promise<T> {
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
  public status: number;
  public details?: any;

  constructor({ message, status, details }: { message: string; status: number; details?: any }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
} 