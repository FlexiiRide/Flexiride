'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bike, Car, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import type { User, Vehicle } from '@/lib/types';
import { startOfDay } from 'date-fns';

type ListingDetailsProps = {
  vehicle: Vehicle;
  owner: User | undefined;
};

// Helper function to check if a date is within the available ranges
const isDateDisabled = (
  date: Date,
  availableRanges: Vehicle['availableRanges']
) => {
  const day = startOfDay(date);
  return !availableRanges.some((range) => {
    const from = startOfDay(new Date(range.from));
    const to = startOfDay(new Date(range.to));
    return day >= from && day <= to;
  });
};

export function ListingDetails({ vehicle, owner }: ListingDetailsProps) {
  const VehicleIcon = vehicle.type === 'car' ? Car : Bike;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {vehicle.images.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt={`${vehicle.title} image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>

        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">
              {vehicle.title}
            </h1>
            <Badge variant="secondary" className="capitalize">
              <VehicleIcon className="h-4 w-4 mr-1.5" />
              {vehicle.type}
            </Badge>
          </div>

          {owner && (
            <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
              <Avatar>
                <AvatarImage src={owner.avatarUrl} alt={owner.name} />
                <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <span>Hosted by</span>
                <span className="font-semibold text-foreground ml-1">
                  {owner.name}
                </span>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">
                {vehicle.location.address}
              </span>
            </div>
          </div>

          <p className="mt-6 text-muted-foreground">{vehicle.description}</p>

          <Separator className="my-6" />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex justify-between items-baseline">
                <span>Booking</span>
                <span>
                  <span className="font-bold text-foreground">
                    ${vehicle.pricePerHour.toFixed(2)}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    /hour
                  </span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label>Select Dates</Label>
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    className="p-0 mt-2"
                    disabled={
                      isClient
                        ? (date) =>
                            isDateDisabled(date, vehicle.availableRanges)
                        : () => true
                    }
                  />
                </div>
                <Button size="lg" className="w-full">
                  Request to Book
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
