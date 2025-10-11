'use client';

import { useEffect, useRef, useState } from 'react';
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
import {
  checkTokenExpiration,
  logout,
  extendSession,
} from '@/lib/actions/auth-check';
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
  const [isExtending, setIsExtending] = useState(false);
  const router = useRouter();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { isExpired, expiresAt, hasToken } =
        await checkTokenExpiration();

      if (!hasToken) return;

      if (isExpired) {
        setShowExpiredDialog(true);
        setShowWarningDialog(false);
        return;
      }

      if (expiresAt) {
        const now = new Date();
        const timeLeft = expiresAt.getTime() - now.getTime();
        const minutesLeft = Math.floor(timeLeft / 1000 / 60);

        if (minutesLeft <= 5 && minutesLeft > 0) {
          setTimeRemaining(minutesLeft);
          setShowWarningDialog(true);
        } else if (minutesLeft > 5) {
          setShowWarningDialog(false);
        }
      }
    };

    checkSession();
    intervalRef.current = setInterval(checkSession, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  
  const handleExtendSession = async () => {
    setIsExtending(true);

    try {
      const result = await extendSession();

      if (result.success) {
        setShowWarningDialog(false);
        router.refresh();
      } else {
        setShowWarningDialog(false);
        setShowExpiredDialog(true);
      }
    } catch (error) {
      console.error('Error extending session:', error);
      setShowWarningDialog(false);
      setShowExpiredDialog(true);
    } finally {
      setIsExtending(false);
    }
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
            <AlertDialogCancel onClick={handleLogout} disabled={isExtending}>
              Log Out
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExtendSession}
              disabled={isExtending}
            >
              {isExtending ? 'Extending...' : 'Stay Logged In'}
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
