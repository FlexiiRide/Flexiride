import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileClient from '@/components/profile/profile-client';
import { User } from '@/lib/types';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // At this point, user is guaranteed to not be null
  return <ProfileClient user={user as User} />;
}
