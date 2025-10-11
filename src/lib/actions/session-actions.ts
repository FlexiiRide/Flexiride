'use server';

import { cookies } from 'next/headers';
import { getUserDetails } from './user-actions';
import { User } from '@/lib/types';

/**
 * Refresh user session data by fetching latest user details from server
 */
export async function refreshUserSession(userId: string) {
  try {
    const result = await getUserDetails(userId);
    
    if (result.success && result.data) {
      // Update the session cookie with fresh user data
      const cookieStore = await cookies();
      
      cookieStore.set('session-user', JSON.stringify(result.data), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      
      return {
        success: true,
        data: result.data,
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error refreshing user session:', error);
    return {
      success: false,
      error: 'Failed to refresh user session',
    };
  }
}