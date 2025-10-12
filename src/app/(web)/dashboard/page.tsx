import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getEnrichedBookings, getVehicles } from '@/lib/data';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const isOwner = user.role === 'owner';
  
  
  const myVehicles = isOwner
    ? await getVehicles({ ownerId: user.id }) // only current owner's vehicles
    : [];

  /// Fetch enriched bookings
  const bookings = await getEnrichedBookings(isOwner);

  return (
    <DashboardClient
      user={user}
      bookings={bookings}
      myVehicles={myVehicles}
      isOwner={isOwner}
    />
  );
}
