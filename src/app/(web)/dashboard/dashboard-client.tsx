'use client';

import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { AddVehicleModal } from '@/components/vehicles/AddVehicleModal';
import { Booking, User, Vehicle } from '@/lib/types';
import { createVehicle } from '@/lib/actions/vehicles';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { SessionChecker } from '@/components/auth/SessionChecker';

interface DashboardClientProps {
  user: User;
  bookings: Booking[];
  myVehicles: Vehicle[];
  isOwner: boolean;
}

export function DashboardClient({
  user,
  bookings,
  myVehicles,
  isOwner,
}: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleVehicleSubmit = async (formData: {
    title: string;
    type: 'car' | 'bike';
    pricePerHour: string;
    pricePerDay: string;
    images: File[];
    location: { address: string; lat: string; lng: string };
    availableRanges: { from: string; to: string }[];
    description: string;
  }) => {
    setIsSubmitting(true);

    try {
      // Convert form data to match the server action input
      const vehicleData = {
        title: formData.title,
        type: formData.type,
        pricePerHour: parseFloat(formData.pricePerHour),
        pricePerDay: parseFloat(formData.pricePerDay),
        images: formData.images,
        location: {
          address: formData.location.address,
          lat: parseFloat(formData.location.lat),
          lng: parseFloat(formData.location.lng),
        },
        availableRanges: formData.availableRanges.map((range) => ({
          from: new Date(range.from).toISOString(),
          to: new Date(range.to).toISOString(),
        })),
        description: formData.description,
      };

      const result = await createVehicle(vehicleData);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Vehicle created successfully!',
        });
        setIsModalOpen(false);
        router.refresh(); // Refresh the page data
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create vehicle',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting vehicle:', error);
      toast({
        title: 'Error',
        description: JSON.stringify(error) || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <SessionChecker />

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
                  bookings.map(
                    (booking: {
                      id: Key | null | undefined;
                      vehicleId:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<AwaitedReactNode>
                        | null
                        | undefined;
                      from: string | number | Date;
                      to: string | number | Date;
                      status:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | Promise<AwaitedReactNode>
                        | null
                        | undefined;
                      totalPrice: number;
                    }) => (
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
                    )
                  )
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
              {myVehicles.map(
                (vehicle: {
                  id: any;
                  ownerId: string;
                  title: string;
                  type: 'car' | 'bike';
                  pricePerHour: number;
                  pricePerDay: number;
                  images: string[];
                  location: { address: string; lat: number; lng: number };
                  availableRanges: { from: string; to: string }[];
                  description: string;
                  status: 'active' | 'inactive';
                }) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                )
              )}

              {/* Add Vehicle Card */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary transition-all duration-300 bg-card hover:bg-accent/5"
              >
                <div className="aspect-[4/3] flex items-center justify-center bg-muted/30">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-muted-foreground/25 group-hover:border-primary flex items-center justify-center transition-colors">
                      <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    Add New Vehicle
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    List your vehicle for rent
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleVehicleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
