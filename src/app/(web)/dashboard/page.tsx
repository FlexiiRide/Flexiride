import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBookings, getVehicles } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
    <div className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your account.
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        <div>
          <h2 className="text-2xl font-bold font-headline mb-4">
            {isOwner ? 'Your Booking Requests' : 'Your Bookings'}
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">
                          Vehicle ID: {booking.vehicleId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.from), 'PPP p')} -{' '}
                          {format(new Date(booking.to), 'p')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            booking.status === 'approved'
                              ? 'default'
                              : booking.status === 'rejected' ||
                                  booking.status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="capitalize"
                        >
                          {booking.status}
                        </Badge>
                        <p className="font-semibold mt-1">
                          ${booking.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-muted-foreground">
                    No bookings found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {isOwner && (
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">
              Your Vehicles
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myVehicles.length > 0 ? (
                myVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))
              ) : (
                <p className="text-muted-foreground col-span-full">
                  You haven&apos;t listed any vehicles yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
