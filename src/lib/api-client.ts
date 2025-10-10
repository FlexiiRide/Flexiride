'use server';

import { cookies } from 'next/headers';

/**
 * Get auth token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const token = (await cookies()).get('session-user-token')?.value;
  return token || null;
}

/**
 * Generic API client with auth support
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    throw new Error('API_BASE_URL is not configured');
  }

  const url = `${baseUrl}${endpoint}`;

  // Use a Headers object so we can call .set without type errors
  const headers = new Headers(options.headers as HeadersInit);

  // Add auth token if available
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Add Content-Type for non-FormData requests
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload files with multipart/form-data
 */
export async function uploadFiles<T = any>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body: formData,
  });
}
