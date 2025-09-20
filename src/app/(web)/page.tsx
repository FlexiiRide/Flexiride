import Image from 'next/image';
import { getVehicles } from '@/lib/data';
import { SearchForm } from '@/components/vehicles/search-form';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default async function HomePage() {
  const popularVehicles = await getVehicles({ limit: 6 });

  return (
    <div>
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center text-white">
        <Image
          src={PlaceHolderImages[0].imageUrl}
          alt={PlaceHolderImages[0].description}
          fill
          className="object-cover"
          priority
          data-ai-hint={PlaceHolderImages[0].imageHint}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container z-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-lg">
            Find Your Perfect Ride, Right Now
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-200 drop-shadow">
            Rent cars and bikes from a community of local owners.
          </p>
          <SearchForm />
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              Popular Vehicles
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Browse our most popular cars and bikes available for rent right now.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
