'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login, LoginState } from '@/lib/actions/auth-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  );
}

export function LoginForm() {
  const initialState: LoginState = {
    errors: {},
    message: null,
  };
  const router = useRouter();
  const { toast } = useToast();
  const [state, dispatch] = useActionState(login, initialState);

  // Trigger toast notifications when message changes
  useEffect(() => {
    if (!state?.message) return;

    if (state.message === 'Login successful') {
      toast({
        title: '✅ Login Successful',
        description: 'Redirecting...',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else if (state.message.includes('Failed') || state?.errors?.server) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description:
          state.errors?.server?.[0] || 'Invalid credentials. Please try again.',
      });
    }
  }, [state, toast, router]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="grid gap-4">
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>
                {state.errors.server.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
              aria-describedby="email-error"
            />
            {state?.errors?.email && (
              <p
                id="email-error"
                className="text-sm font-medium text-destructive"
              >
                {state.errors.email}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              required
              aria-describedby="password-error"
            />
            {state?.errors?.password && (
              <p
                id="password-error"
                className="text-sm font-medium text-destructive"
              >
                {state.errors.password}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <LoginButton />
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
