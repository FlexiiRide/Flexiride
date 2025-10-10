'use server';

import { cookies } from 'next/headers';
import {
  handleAuthError,
  extendSession,
  checkTokenExpiration,
  logout,
} from './actions/auth-check';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isAuthError?: boolean;
}

/**
 * Get valid access token, refresh if expired
 */
async function getValidToken(): Promise<string | null> {
  const { isExpired } = await checkTokenExpiration();
  if (isExpired) {
    const result = await extendSession();
    if (!result.success) {
      await logout();
      return null;
    }
  }
  const cookieStore = await cookies();
  return cookieStore.get('access-token')?.value || null;
}

/**
 * Get API base URL
 */
function getBaseUrl(): string {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new Error('API_BASE_URL is not configured');
  return baseUrl;
}

export interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean;
  isFormData?: boolean;
}

/**
 * Centralized API client
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  const {
    requireAuth = true,
    isFormData = false,
    headers = {},
    ...fetchOptions
  } = options;

  try {
    // Get token if authentication is required
    let token: string | null = null;
    if (requireAuth) {
      token = await getValidToken();
      if (!token) {
        return {
          success: false,
          error: 'Not authenticated',
          isAuthError: true,
        };
      }
    }

    // Build headers using Headers so we can safely set entries
    const requestHeaders = new Headers(headers as HeadersInit);

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    // Only set Content-Type for non-FormData requests
    if (!isFormData && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    // Make the request
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers: requestHeaders,
      cache: fetchOptions.cache || 'no-store',
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(
        errorData.message || `Request failed: ${response.status}`
      );
    }

    // Parse response
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    const authError = await handleAuthError(error);
    return {
      success: false,
      error: authError.message,
      isAuthError: authError.isAuthError,
    };
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: <T = any>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      isFormData: body instanceof FormData,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      isFormData: body instanceof FormData,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      isFormData: body instanceof FormData,
    }),

  delete: <T = any>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
