'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signup, SignupState } from '@/lib/actions';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function SignupButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Creating account...' : 'Create an account'}
    </Button>
  );
}

export function SignupForm() {
  const initialState: SignupState = {
    errors: {},
    message: null,
  };

  const [state, dispatch] = useActionState(signup, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Create an account to start renting or listing your vehicles.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="grid gap-4">
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign Up Failed</AlertTitle>
              <AlertDescription>
                {state.errors.server.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
            {state?.errors?.name && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.name}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
            {state?.errors?.email && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.email}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" required />
            {state?.errors?.password && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.password}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>I want to:</Label>
            <RadioGroup
              defaultValue="client"
              name="role"
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="role-client" />
                <Label htmlFor="role-client" className="font-normal">
                  Rent a vehicle
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owner" id="role-owner" />
                <Label htmlFor="role-owner" className="font-normal">
                  List my vehicle
                </Label>
              </div>
            </RadioGroup>
            {state?.errors?.role && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.role}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SignupButton />
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
