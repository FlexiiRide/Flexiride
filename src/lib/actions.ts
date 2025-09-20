'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getUserByEmail } from './data';

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
    const user = await getUserByEmail(email);

    if (!user) {
      return { errors: { server: ['Invalid credentials'] } };
    }

    // This is mock auth, so we just check against the stored hash
    if (user.passwordHash !== password) {
      return { errors: { server: ['Invalid credentials'] } };
    }

    (await cookies()).set('session-userid', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
  } catch (error) {
    return { errors: { server: ['Something went wrong.'] } };
  }

  redirect('/dashboard');
}

export async function logout() {
  (await cookies()).delete('session-userid');
  redirect('/login');
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

  const { email } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return {
      errors: { server: ['An account with this email already exists.'] },
    };
  }

  // In a real app, you would create the user in the database here.
  // For this mock, we'll just log them in as a new user would be created.
  // We'll simulate creating user with id 'u_5'

  const newUser = {
    id: `u_${Math.floor(Math.random() * 1000)}`,
    ...validatedFields.data,
    passwordHash: validatedFields.data.password,
    phone: '',
    avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
  };

  // In a real app, you'd add this user to your database.
  // For now, we will just proceed to log them in.

  (
    await // In a real app, you'd add this user to your database.
    // For now, we will just proceed to log them in.
    cookies()
  ).set('session-userid', newUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  redirect('/dashboard');
}
