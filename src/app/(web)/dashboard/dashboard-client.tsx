'use client';

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { AddVehicleModal } from '@/components/vehicles/AddVehicleModal';
import { EnrichedBooking, User, Vehicle } from '@/lib/types';
import { createVehicle } from '@/lib/actions/vehicles-action';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { SessionChecker } from '@/components/auth/SessionChecker';
import {
  changeBookingStatus,
  cancelBooking,
} from '@/lib/actions/bookings-action';

interface DashboardClientProps {
  user: User; //logged-in user
  bookings: EnrichedBooking[];
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
  const [bookingsState, setBookingsState] =
    useState<EnrichedBooking[]>(bookings); // using a local state to update the same bookings
  const [loadingAction] = useState<{ [key: string]: string }>({});

  const router = useRouter();
  const { toast } = useToast();

  // Handle Approve, Reject, Cancel
  const handleBookingAction = async (
    bookingId: string,
    newStatus: 'approved' | 'rejected' | 'cancelled'
  ) => {
    try {
      let result;

      if (newStatus === 'cancelled') {
        // Client cancels their booking
        result = await cancelBooking(bookingId);
      } else {
        // Owner approves or rejects booking
        result = await changeBookingStatus(bookingId, newStatus);
      }

      if (result.success && result.data) {
        // Update local UI immediately
        setBookingsState((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: newStatus } : b
          )
        );

        toast({
          title: 'Success',
          description:
            newStatus === 'approved'
              ? '✅ Booking approved successfully'
              : newStatus === 'rejected'
                ? 'Booking rejected'
                : 'Booking cancelled',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update booking',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to update booking',
        variant: 'destructive',
      });
    }
  };

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
      {/* Welcome Header */}
      <Card className="bg-[#eaecf7] dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold font-headline">
                Welcome, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Here&apos;s a quick overview of your Account.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mt-12">
        {/* Bookings Section */}
        <h2 className="text-2xl font-bold font-body mb-4">
          {isOwner ? 'Booking Requests' : 'Your Bookings'}
        </h2>
        <div className="space-y-2">
          {bookingsState.filter((booking) => booking.status !== 'cancelled')
            .length === 0 ? (
            <p className="text-muted-foreground text-sm">No bookings found.</p>
          ) : (
            bookingsState
              .filter((booking) => booking.status !== 'cancelled') // skip cancelled
              .map((booking) => {
                const statusColor = {
                  approved:
                    'bg-green-200 text-green-700 dark:bg-green-300 dark:text-green-900',
                  rejected:
                    'bg-red-200 text-red-700 dark:bg-red-300 dark:text-red-900',
                  requested:
                    'bg-yellow-200 text-yellow-700 dark:bg-yellow-300 dark:text-yellow-900',
                  cancelled:
                    'bg-gray-200 text-white-700 dark:bg-yellow-300 dark:text-yellow-900',
                };

                // Lookup vehicle, client, and owner by string ID
                const vehicle = booking.vehicle;
                const owner = booking.owner;
                const client = booking.client;

                return (
                  <Card
                    key={booking.id}
                    className="bg-slate-100 dark:bg-transparent dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md px-4 py-4 transition-all duration-200 hover:shadow-md hover:scale-[1.01] hover:border hover:border-gray-300 dark:hover:border-gray-700 w-full"
                  >
                    <div className="flex flex-col md:flex-row gap-8 md:items-center">
                      {/* Left Section: Vehicle Image + Info */}
                      <div className="flex flex-col flex-1 gap-4 md:gap-6">
                        {/* Top Row: Image + Title + ID */}
                        <div className="flex items-start gap-4">
                          {/* Vehicle Image */}
                          <img
                            src={vehicle?.images?.[0]}
                            alt={vehicle?.title}
                            className="w-12 h-12 object-cover rounded-md"
                          />

                          {/* Title + ID + Badge */}
                          <div className="flex flex-col justify-center">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                              {vehicle?.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              ID: {vehicle?.id || booking.vehicleId}
                            </p>
                          </div>
                          <Badge
                            className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${
                              statusColor[booking.status] ||
                              'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        {/* Bottom Row: Renter, Dates, Price */}
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {/* Headings */}
                          <p className="text-xs font-medium text-muted-foreground">
                            {isOwner ? 'Renter' : 'Owner'}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground">
                            Dates
                          </p>
                          <p className="text-xs font-medium text-muted-foreground">
                            Total Price
                          </p>

                          {/* Values */}
                          <p className="text-sm text-gray-800 dark:text-white">
                            {isOwner ? client?.name : owner?.name || 'Unknown'}
                          </p>
                          <div className="text-sm text-gray-800 dark:text-white leading-tight">
                            {format(new Date(booking.from), 'PPP p')} <br />
                            {format(new Date(booking.to), 'PPP p')}
                          </div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            $ {booking.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Right Section: Actions */}
                      <div className="min-w-[160px] flex-shrink-0 flex justify-end gap-2">
                        {isOwner &&
                          booking.status === 'requested' &&
                          new Date(booking.from) > new Date() && (
                            <>
                              <button
                                className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={!!loadingAction[booking.id]}
                                onClick={() =>
                                  handleBookingAction(
                                    String(booking.id),
                                    'approved'
                                  )
                                }
                              >
                                {loadingAction[booking.id] === 'approving'
                                  ? 'Approving...'
                                  : 'Approve'}
                              </button>
                              <button
                                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-700 text-sm font-medium"
                                disabled={!!loadingAction[booking.id]}
                                onClick={() =>
                                  handleBookingAction(
                                    String(booking.id),
                                    'rejected'
                                  )
                                }
                              >
                                {loadingAction[booking.id] === 'rejecting'
                                  ? 'Rejecting...'
                                  : 'Reject'}
                              </button>
                            </>
                          )}

                        {!isOwner &&
                          (booking.status === 'approved' ||
                            booking.status === 'requested') &&
                          new Date(booking.from) > new Date() && (
                            <button
                              className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-800 text-sm font-medium"
                              disabled={!!loadingAction[booking.id]}
                                onClick={() =>
                                  handleBookingAction(
                                    String(booking.id),
                                    'cancelled'
                                  )
                                }
                              >
                                {loadingAction[booking.id] === 'cancelling'
                                  ? 'Cancelling...'
                                  : 'Cancel'}
                            </button>
                          )}
                      </div>
                    </div>
                  </Card>
                );
              })
          )}
        </div>

        {isOwner && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold font-body mb-4">Your Vehicles</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myVehicles?.map(
                (vehicle: {
                  id: any;
                  ownerId: string;
                  title: string;
                  type: 'car' | 'bike';
                  pricePerHour: number;
                  pricePerDay: number;
                  images?: string[];
                  location: { address: string; lat: number; lng: number };
                  availableRanges: { from: string; to: string }[];
                  description: string;
                  status: 'active' | 'inactive';
                }) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                )
              )}

              {/* Add Vehicle Card with proper styling */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary transition-all duration-300 bg-card hover:bg-accent/5"
              >
                {/* Match VehicleCard structure - assuming it has image at top and content below */}
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
