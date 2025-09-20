import Image from 'next/image';
import Link from 'next/link';
import { Car, Bike, MapPin } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComponentProps } from 'react';

type VehicleCardProps = {
  vehicle: Vehicle;
} & ComponentProps<typeof Card>

export function VehicleCard({ vehicle, ...props }: VehicleCardProps) {
  const VehicleIcon = vehicle.type === 'car' ? Car : Bike;
  const imageHint = vehicle.type === 'car' ? 'car sedan' : 'motorcycle scooter';

  return (
    <Card className="overflow-hidden flex flex-col h-full" {...props}>
      <CardHeader className="p-0">
        <Link href={`/listing/${vehicle.id}`} className="block relative aspect-[3/2] w-full">
          <Image
            src={vehicle.images[0]}
            alt={vehicle.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            data-ai-hint={imageHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
            <Badge variant="secondary" className="capitalize mb-2">
                <VehicleIcon className="h-3 w-3 mr-1.5" />
                {vehicle.type}
            </Badge>
            {vehicle.status === 'inactive' && <Badge variant="destructive">Inactive</Badge>}
        </div>
        <CardTitle as="h3" className="text-lg font-semibold mb-1">
          <Link href={`/listing/${vehicle.id}`}>{vehicle.title}</Link>
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
          <span>{vehicle.location.address}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50">
        <div className="flex items-baseline justify-between w-full">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <p>
            <span className="text-xl font-bold text-foreground">
              ${vehicle.pricePerHour.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">/hour</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
