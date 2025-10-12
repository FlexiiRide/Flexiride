'use server';
import { cookies } from 'next/headers';
import type { User } from './types';
import { checkTokenExpiration, extendSession, logout } from './actions/auth-check';

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

export async function getSession() {
  const userCookie = (await cookies()).get('session-user')?.value;
  if (!userCookie) return null;
  try {
    const user = JSON.parse(userCookie);
    return user || null;
  } catch {
    return null;
  }
}

export async function getAccessToken() {
  return (await cookies()).get('access-token')?.value || null;
}

export async function getRefreshToken() {
  return (await cookies()).get('refresh-token')?.value || null;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  return session as User;
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const token = await getValidToken();
    if (!token) return undefined;

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) return undefined;
    const user: User = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return undefined;
  }
}
