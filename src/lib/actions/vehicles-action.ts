'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Vehicle } from '@/lib/types';
import {
  handleAuthError,
  extendSession,
  checkTokenExpiration,
  logout,
} from './auth-check';

export interface CreateVehicleInput {
  title: string;
  type: 'car' | 'bike';
  pricePerHour: number;
  pricePerDay: number;
  location: { address: string; lat: number; lng: number };
  availableRanges: { from: string; to: string }[];
  description: string;
  images: File[];
}

/**
 * Get valid access token, refresh if expired
 */
async function getValidToken(): Promise<string | null> {
  const { isExpired } = await checkTokenExpiration();
  if (isExpired) {
    const result = await extendSession();
    if (!result.success) {
      await logout(); // force logout if refresh fails
      return null;
    }
  }
  const cookieStore = await cookies();
  return cookieStore.get('access-token')?.value || null;
}

/**
 * Create a new vehicle
 */
export async function createVehicle(input: CreateVehicleInput): Promise<{
  success: boolean;
  data?: Vehicle;
  error?: string;
  isAuthError?: boolean;
}> {
  try {
    const token = await getValidToken();
    if (!token)
      return { success: false, error: 'Not authenticated', isAuthError: true };

    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) throw new Error('API_BASE_URL is not configured');

    const formData = new FormData();
    formData.append('title', input.title);
    formData.append('type', input.type);
    formData.append('pricePerHour', input.pricePerHour.toString());
    formData.append('pricePerDay', input.pricePerDay.toString());
    formData.append('description', input.description);
    formData.append('location', JSON.stringify(input.location));
    formData.append('availableRanges', JSON.stringify(input.availableRanges));
    input.images.forEach((image) => formData.append('images', image));

    const response = await fetch(`${baseUrl}/vehicles`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || 'Failed to create vehicle');
    }

    const vehicle = await response.json();
    revalidatePath('/dashboard');
    return { success: true, data: vehicle };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    const authError = await handleAuthError(error);
    return {
      success: false,
      error: authError.message,
      isAuthError: authError.isAuthError,
    };
  }
}

/**
 * Get all vehicles owned by current user
 */
export async function getMyVehicles(): Promise<{
  success: boolean;
  data?: Vehicle[];
  error?: string;
}> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/vehicles/owner/my-vehicles`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch vehicles');

    const vehicles = await response.json();
    return { success: true, data: vehicles };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch vehicles',
    };
  }
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(
  vehicleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete vehicle');

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete vehicle',
    };
  }
}

/**
 * Get a single vehicle by ID (public endpoint - no auth required)
 */
export async function getVehiclesById(id: string): Promise<{
  success: boolean;
  data?: Vehicle;
  error?: string;
}> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) throw new Error('API_BASE_URL is not configured');

    const url = `${baseUrl}/vehicles/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || 'Failed to fetch vehicle');
    }

    const vehicle = await response.json();
    return { success: true, data: vehicle };
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch vehicle',
    };
  }
}

/**
 * Search vehicles based on location and date range
 */
export async function getSearchedVehicles(filters: {
  location?: string;
  from?: string;
  to?: string;
}): Promise<{
  success: boolean;
  data?: Vehicle[];
  error?: string;
}> {
  try {
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) throw new Error('API_BASE_URL is not configured');

    // Build query parameters
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);

    const url = `${baseUrl}/vehicles/search?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || 'Failed to search vehicles');
    }

    const vehicles = await response.json();
    return { success: true, data: vehicles };
  } catch (error) {
    console.error('Error searching vehicles:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to search vehicles',
    };
  }
}

/**
 * Get popular vehicles (public endpoint - no auth required)
 * Currently returns most recent vehicles, will be updated to use booking count
 */
export async function getPopularVehicles(filters?: {
  limit?: number;
  type?: 'car' | 'bike';
}): Promise<{
  success: boolean;
  data?: Vehicle[];
  error?: string;
}> {
  try {
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) throw new Error('API_BASE_URL is not configured');

    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type) params.append('type', filters.type);

    const url = `${baseUrl}/vehicles/popular?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || 'Failed to fetch popular vehicles');
    }

    const vehicles = await response.json();
    return { success: true, data: vehicles };
  } catch (error) {
    console.error('Error fetching popular vehicles:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch popular vehicles',
    };
  }
}

/**
 * Update vehicle status
 */
export async function updateVehicleStatus(
  vehicleId: string,
  status: 'active' | 'inactive'
): Promise<{ success: boolean; data?: Vehicle; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    const formData = new FormData();
    formData.append('status', status);

    const baseUrl = process.env.API_BASE_URL;
    const response = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to update vehicle status');

    const vehicle = await response.json();
    revalidatePath('/dashboard');
    return { success: true, data: vehicle };
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update vehicle status',
    };
  }
}
