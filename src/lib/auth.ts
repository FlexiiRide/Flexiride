'use server';
import { cookies } from 'next/headers';
import type { User } from './types';

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
