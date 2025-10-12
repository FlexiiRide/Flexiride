'use client';

import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthRequiredModalProps {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void;
}

export function AuthRequiredModal({
  open,
  onOpenChange,
}: AuthRequiredModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Login Required</AlertDialogTitle>
          <AlertDialogDescription>
            You need to be logged in to view vehicle details and make a booking.
            Please login or create an account to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Link href="/login" className="flex-1 sm:flex-initial">
            <AlertDialogAction className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </AlertDialogAction>
          </Link>
          <Link href="/signup" className="flex-1 sm:flex-initial">
            <AlertDialogAction className="w-full bg-primary/90 hover:bg-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </AlertDialogAction>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
