'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Decode a JWT token safely
 */
function decodeJwt(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if access token is valid / expired
 */
export async function checkTokenExpiration(): Promise<{
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
}> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;

    if (!accessToken) {
      return { isValid: false, isExpired: false };
    }

    const payload = decodeJwt(accessToken);
    if (!payload?.exp) {
      return { isValid: false, isExpired: false };
    }

    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = expiresAt < now;

    return {
      isValid: !isExpired,
      isExpired,
      expiresAt,
    };
  } catch (error) {
    console.error('Error checking token:', error);
    return { isValid: false, isExpired: false };
  }
}

/**
 * Logout user — clear cookies and redirect to login
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('access-token');
  cookieStore.delete('refresh-token');
  cookieStore.delete('session-user');
  redirect('/login');
}

/**
 * Attempt to refresh the access token using refresh token
 */
export async function extendSession(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh-token')?.value;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token found' };
    }

    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) {
      return { success: false, error: 'API not configured' };
    }

    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh tokens:', errorText);
      return { success: false, error: 'Failed to refresh token' };
    }

    const data = await response.json();

    // Update cookies with new tokens
    if (data.accessToken) {
      cookieStore.set('access-token', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 16,
      });
    }

    if (data.refreshToken) {
      cookieStore.set('refresh-token', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // Also update session user if needed
    if (data.user) {
      cookieStore.set('session-user', JSON.stringify(data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error extending session:', error);
    return { success: false, error: 'Failed to extend session' };
  }
}

/**
 * Generic handler for API auth errors
 */
export async function handleAuthError(error: any): Promise<{
  isAuthError: boolean;
  message: string;
}> {
  const errorMessage = error instanceof Error ? error.message : String(error);

  const isAuthError =
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('401') ||
    errorMessage.includes('Not authenticated') ||
    errorMessage.includes('Invalid token') ||
    errorMessage.includes('Token expired');

  return {
    isAuthError,
    message: isAuthError
      ? 'Your session has expired. Please log in again.'
      : errorMessage,
  };
}
