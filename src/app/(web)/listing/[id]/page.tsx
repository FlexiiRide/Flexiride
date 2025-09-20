import { getVehicleById, getUserById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ListingDetails } from '@/components/vehicles/listing-details';

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const vehicle = await getVehicleById(params.id);

  if (!vehicle) {
    notFound();
  }

  const owner = await getUserById(vehicle.ownerId);

  return <ListingDetails vehicle={vehicle} owner={owner} />;
}
