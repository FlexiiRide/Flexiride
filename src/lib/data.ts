'use server';
import { getMyVehicles } from './actions/vehicles-action';
import { type EnrichedBooking, type Vehicle } from './types';
import { getMyBookings, getBookingsForOwner } from './actions/bookings-action';
import { getUserById } from './auth';
import { getVehicleById } from './actions/vehicles-action';

// Simulate network latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Vehicle Functions
export async function getVehicles(filters?: {
  limit?: number;
  type?: 'car' | 'bike';
  ownerId?: string;
}): Promise<Vehicle[]> {
  await delay(300);

  let vehicles = (await getMyVehicles())?.data as unknown as Vehicle[];

  if (filters?.type) {
    vehicles = vehicles?.filter((v) => v.type === filters.type);
  }

  if (filters?.ownerId) {
    vehicles = vehicles?.filter((v) => v.ownerId === filters.ownerId);
  }

  if (filters?.limit) {
    return vehicles?.slice(0, filters.limit);
  }

  return vehicles;
}

// ------------------------------------------------------------------
// USER & BOOKING FUNCTIONS ( NOW USING REAL BACKEND DATA)
// ------------------------------------------------------------------
export async function getEnrichedBookings(
  forOwner: boolean
): Promise<EnrichedBooking[]> {
  try {
    const res = forOwner ? await getBookingsForOwner() : await getMyBookings();
    if (!res.success || !res.data) return [];

    const bookings = res.data;

    const enriched: EnrichedBooking[] = await Promise.all(
      bookings.map(async (b) => ({
        ...b,
        vehicle: await getVehicleById(b.vehicleId),
        owner: await getUserById(b.ownerId),
        client: await getUserById(b.clientId),
      }))
    );

    return enriched;
  } catch (err) {
    console.error('Error enriching bookings:', err);
    return [];
  }
}
