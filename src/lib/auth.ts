import 'server-only';
import { cookies } from 'next/headers';
import type { User } from './types';

export async function getSession() {
  const userCookie = (await cookies()).get('session-user')?.value;
  if (!userCookie) {
    return null;
  }
  try {
    const user = JSON.parse(userCookie);
    return user || null;
  }
  catch (error) {
    return null;
  }
}

export async function getUserId() {
  return (await cookies()).get('session-userid')?.value;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  return session as User;
}
