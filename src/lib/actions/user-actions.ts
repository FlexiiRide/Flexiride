'use server';

import { api } from '@/lib/api-client';
import { User } from '@/lib/types';

export interface UpdateUserData {
  name?: string;
  bio?: string;
  avatar?: File;
}

/**
 * Fetch user details by ID
 */
export async function getUserDetails(userId: string) {
  try {
    const response = await api.get<User>(`/users/${userId}`);

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Failed to fetch user details',
        isAuthError: response.isAuthError,
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return {
      success: false,
      error: 'Failed to fetch user details',
    };
  }
}

/**
 * Update user details
 */
export async function updateUserDetails(
  userId: string,
  userData: UpdateUserData
) {
  try {
    // Create FormData for multipart/form-data request
    const formData = new FormData();

    if (userData.name) {
      formData.append('name', userData.name);
    }

    if (userData.bio) {
      formData.append('bio', userData.bio);
    }

    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }

    const response = await api.put<User>(`/users/${userId}`, formData);

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Failed to update user details',
        isAuthError: response.isAuthError,
      };
    }

    return {
      success: true,
      data: response.data,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Error updating user details:', error);
    return {
      success: false,
      error: 'Failed to update user details',
    };
  }
}
