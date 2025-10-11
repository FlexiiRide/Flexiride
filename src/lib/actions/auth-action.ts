'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    server?: string[];
  };
  message?: string | null;
};

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to login.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        errors: { server: [errorData.message || 'Invalid credentials'] },
      };
    }

    const { accessToken, refreshToken, user } = await res.json();

    const cookieStore = await cookies();

    // Save user info
    cookieStore.set('session-user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Save access token (short-lived)
    cookieStore.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 16,
      path: '/',
    });

    // Save refresh token (longer-lived)
    cookieStore.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return { message: 'Login successful' };
  } catch (error) {
    return { errors: { server: ['Something went wrong.'] } };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session-user');
  cookieStore.delete('access-token');
  cookieStore.delete('refresh-token');
}

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'owner']),
});

export type SignupState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    server?: string[];
  };
  message?: string | null;
};

export async function signup(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const validatedFields = signupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to sign up.',
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        errors: { server: [errorData.message || 'Invalid credentials'] },
      };
    }

    const { accessToken, refreshToken, user } = await res.json();

    const cookieStore = await cookies();

    cookieStore.set('session-user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 16,
      path: '/',
    });

    cookieStore.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { message: 'Signup successful' };
  } catch (error) {
    return { errors: { server: ['Something went wrong.'] } };
  }
}
