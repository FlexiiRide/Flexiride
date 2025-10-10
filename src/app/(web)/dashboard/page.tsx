import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBookings, getVehicles } from '@/lib/data';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const isOwner = user.role === 'owner';
  const bookings = await getBookings(
    isOwner ? { ownerId: user.id } : { clientId: user.id }
  );
  const myVehicles = isOwner ? await getVehicles({ ownerId: user.id }) : [];

  return (
    <DashboardClient
      user={user}
      bookings={bookings}
      myVehicles={myVehicles}
      isOwner={isOwner}
    />
  );
}
