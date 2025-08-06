import { getAuthHeaders } from './api';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export interface ApiRequestOptions extends RequestInit {
  data?: any;
  params?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Enhanced API request function with automatic authentication and flexible parameters
 * 
 * @param endpoint - API endpoint (e.g., '/tasks', '/users')
 * @param options - Request options including data, params, and fetch options
 * @returns Promise<ApiResponse<T>>
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> => {
  try {
    const { data, params, ...fetchOptions } = options;
    
    // Build URL with query parameters
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Get authentication headers
    const authHeaders = await getAuthHeaders();
    
    // Prepare request body
    let body: string | undefined;
    if (data) {
      body = JSON.stringify(data);
    }

    const response = await fetch(url, {
      method: options.method || (data ? 'POST' : 'GET'),
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      body,
      ...fetchOptions,
    });

    // Handle 401 Unauthorized - token is invalid or expired
    if (response.status === 401) {
      const { TokenManager } = await import('./api');
      const tokenManager = TokenManager.getInstance();
      await tokenManager.clearToken();
      throw new Error('Authentication failed. Please sign in again.');
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get('content-type');
    const hasContent = contentType && contentType.includes('application/json');
    
    let responseData: any = undefined;
    
    if (hasContent) {
      try {
        responseData = await response.json();
        console.log('====================================');
        console.log(responseData, "apiRequest file");
        console.log('====================================');
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          error: 'Invalid JSON response from server',
          status: response.status,
        };
      }
    }

    if (!response.ok) {
      return {
        error: responseData?.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data: responseData,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
};

/**
 * Convenience functions for common HTTP methods
 */
export const apiGet = <T = any>(endpoint: string, params?: Record<string, string | number | boolean>) =>
  apiRequest<T>(endpoint, { method: 'GET', params });

export const apiPost = <T = any>(endpoint: string, data?: any) =>
  apiRequest<T>(endpoint, { method: 'POST', data });

export const apiPut = <T = any>(endpoint: string, data?: any) =>
  apiRequest<T>(endpoint, { method: 'PUT', data });

export const apiPatch = <T = any>(endpoint: string, data?: any) =>
  apiRequest<T>(endpoint, { method: 'PATCH', data });

export const apiDelete = <T = any>(endpoint: string) =>
  apiRequest<T>(endpoint, { method: 'DELETE' }); 