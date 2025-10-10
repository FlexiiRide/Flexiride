'use client';

import { useEffect, useState } from 'react';
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
import { checkTokenExpiration, logout } from '@/lib/actions/auth-check';
import { useRouter } from 'next/navigation';

/**
 * SessionChecker Component
 *
 * This component runs in the background and checks if the user's token
 * is about to expire. It shows a warning dialog allowing the user to
 * extend their session or log out.
 *
 * Add this ONCE in your root layout, not in every page.
 */
export function SessionChecker() {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    let warningTimeout: NodeJS.Timeout | undefined;

    // Check token expiration
    const checkSession = async () => {
      const { isExpired, expiresAt } = await checkTokenExpiration();

      if (isExpired) {
        // Token already expired
        setShowExpiredDialog(true);
        return;
      }

      if (expiresAt) {
        const now = new Date();
        const timeLeft = expiresAt.getTime() - now.getTime();
        const minutesLeft = Math.floor(timeLeft / 1000 / 60);

        // Show warning 5 minutes before expiration
        if (minutesLeft <= 5 && minutesLeft > 0) {
          setTimeRemaining(minutesLeft);
          setShowWarningDialog(true);
        }
      }
    };

    // Check immediately when component mounts
    checkSession();

    // Then check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
      if (warningTimeout) clearTimeout(warningTimeout);
    };
  }, []);

  const handleExtendSession = () => {
    // Refresh the page to get new data and reset session
    setShowWarningDialog(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Warning Dialog - Session about to expire */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
            <AlertDialogDescription>
              Your session will expire in approximately {timeRemaining} minute
              {timeRemaining !== 1 ? 's' : ''}. Would you like to extend your
              session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogout}>
              Log Out
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleExtendSession}>
              Stay Logged In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Expired Dialog - Session already expired */}
      <AlertDialog open={showExpiredDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expired</AlertDialogTitle>
            <AlertDialogDescription>
              Your session has expired for security reasons. Please log in again
              to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLogout}>
              Log In Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
