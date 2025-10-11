'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAllPopularVehicles, searchVehicles } from '@/lib/data';
import { SearchForm } from '@/components/vehicles/search-form';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { type Vehicle } from '@/lib/types';

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load popular vehicles on mount
  useEffect(() => {
    async function loadPopularVehicles() {
      setIsLoading(true);
      try {
        const popularVehicles = await getAllPopularVehicles({ limit: 10 });
        setVehicles(popularVehicles || []);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPopularVehicles();
  }, []);

  const handleSearch = async (params: {
    location?: string;
    from?: string;
    to?: string;
  }) => {
    setIsLoading(true);
    setIsSearching(true);
    try {
      const searchResults = await searchVehicles(params);
      setVehicles(searchResults || []);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              {isSearching ? 'Search Results' : 'Popular Vehicles'}
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              {isSearching
                ? 'Vehicles matching your search criteria'
                : 'Browse our most popular cars and bikes available for rent right now.'}
            </p>
          </div>

          {isLoading ? (
            <div className="mt-12 flex justify-center">
              <div className="text-muted-foreground">Loading vehicles...</div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                {isSearching
                  ? 'No vehicles found matching your search criteria.'
                  : 'No vehicles available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
