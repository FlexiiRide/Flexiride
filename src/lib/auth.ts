import 'server-only';
import { cookies } from 'next/headers';
import { getUserById } from './data';
import type { User } from './types';

export async function getSession() {
  const userId = (await cookies()).get('session-userid')?.value;
  if (!userId) {
    return null;
  }
  try {
    const user = await getUserById(userId);
    return user || null;
  } catch (error) {
    return null;
  }
}

export async function getUserId() {
  return (await cookies()).get('session-userid')?.value;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  return session;
}
