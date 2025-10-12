'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { handleAuthError, extendSession, checkTokenExpiration, logout } from './auth-check';
import { Booking } from '@/lib/types';
export type BookingStatus = 'requested' | 'approved' | 'rejected' | 'cancelled';

export interface CreateBookingInput {
  vehicleId: string;
  ownerId: string;
  from: string;
  to: string;
  totalPrice: number;
  paymentMethod?: 'cash' | 'card';
  pickupDetails: string;
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
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput): Promise<{
  success: boolean;
  data?: Booking;
  error?: string;
  isAuthError?: boolean;
}> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated', isAuthError: true };

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        paymentMethod: input.paymentMethod ?? 'cash',
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      let err;
      try {
        err = JSON.parse(text);
      } catch {
        err = { message: text };
      }
      throw new Error(err.message || 'Failed to create booking');
    }

    const booking = await response.json();
    revalidatePath('/dashboard');
    return { success: true, data: booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    const authError = await handleAuthError(error);
    return { success: false, error: authError.message, isAuthError: authError.isAuthError };
  }
}

/**
 * Update booking (client edits their own booking)
 */
export async function updateBooking(
  bookingId: string,
  data: Partial<CreateBookingInput>
): Promise<{ success: boolean; data?: Booking; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update booking');

    const booking = await response.json();
    revalidatePath('/dashboard');
    return { success: true, data: booking };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update booking' };
  }
}

/**
 * Cancel booking (client)
 */
export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; data?: Booking; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to cancel booking');

    const booking = await response.json();
    revalidatePath('/dashboard');
    return { success: true, data: booking };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to cancel booking' };
  }
}

/**
 * Approve or reject booking (owner)
 */
export async function changeBookingStatus(
  bookingId: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; data?: Booking; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error('Failed to update booking status');

    const booking = await response.json();
    revalidatePath('/dashboard');
    return { success: true, data: booking };
  } catch (error) {
    console.error('Error changing booking status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to change booking status' };
  }
}

/**
 * Get all bookings (optionally filtered)
 */
export async function getBookings(
  filters?: { clientId?: string; ownerId?: string; status?: BookingStatus }
): Promise<{ success: boolean; data?: Booking[]; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    const query = new URLSearchParams(filters as any).toString();
    const response = await fetch(`${baseUrl}/bookings${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch bookings');

    const bookings = await response.json();
    return { success: true, data: bookings };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch bookings' };
  }
}

/**
 * Get bookings for the logged-in client
 */
export async function getMyBookings(): Promise<{ success: boolean; data?: Booking[]; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/bookings/client/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch client bookings');

    const bookings = await response.json();
    return { success: true, data: bookings };
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch client bookings' };
  }
}

/**
 * Get bookings for the logged-in owner
 */
export async function getBookingsForOwner(): Promise<{ success: boolean; data?: Booking[]; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/bookings/owner/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch owner bookings');

    const bookings = await response.json();
    return { success: true, data: bookings };
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch owner bookings' };
  }
}

