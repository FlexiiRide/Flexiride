'use server';
import {
  getMyVehicles,
  getPopularVehicles,
  getSearchedVehicles,
  getVehiclesById,
} from './actions/vehicles-action';
import { type User, type EnrichedBooking, type Vehicle } from './types';
import { getMyBookings, getBookingsForOwner } from './actions/bookings-action';

const mockUsers: User[] = [
  {
    id: 'u_1',
    name: 'Alice Owner',
    email: 'owner@example.com',
    phone: '+94123456789',
    role: 'owner',
    avatarUrl: 'https://picsum.photos/seed/u1/100/100',
    passwordHash: 'password123',
  },
  {
    id: 'u_2',
    name: 'Bob Client',
    email: 'client@example.com',
    phone: '+94987654321',
    role: 'client',
    avatarUrl: 'https://picsum.photos/seed/u2/100/100',
    passwordHash: 'password123',
  },
  {
    id: 'u_3',
    name: 'Charlie Owner',
    email: 'charlie@example.com',
    phone: '+94112233445',
    role: 'owner',
    avatarUrl: 'https://picsum.photos/seed/u3/100/100',
    passwordHash: 'password123',
  },
  {
    id: 'u_4',
    name: 'Diana Client',
    email: 'diana@example.com',
    phone: '+94556677889',
    role: 'client',
    avatarUrl: 'https://picsum.photos/seed/u4/100/100',
    passwordHash: 'password123',
  },
];

// Simulate network latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// User Functions
export async function getUsers(filter?: { role?: string }): Promise<User[]> {
  await delay(100);

  if (filter?.role) {
    return mockUsers.filter((user) => user.role === filter.role);
  }

  return mockUsers;
}

export async function getUserById(id: string): Promise<User | undefined> {
  await delay(100);
  const users = await getUsers();
  return users.find((user) => user.id === id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  await delay(100);
  const users = await getUsers();
  return users.find((user) => user.email === email);
}

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

export async function getAllPopularVehicles(filters?: {
  limit?: number;
  type?: 'car' | 'bike';
}): Promise<Vehicle[]> {
  await delay(300);

  const result = await getPopularVehicles(filters);

  if (!result.success || !result.data) {
    return [];
  }

  return result.data;
}

export async function searchVehicles(filters: {
  location?: string;
  from?: string;
  to?: string;
}): Promise<Vehicle[]> {
  await delay(500);

  // Get all vehicles
  let vehicles = (await getSearchedVehicles(filters))
    ?.data as unknown as Vehicle[];

  if (!vehicles) {
    return [];
  }
  return vehicles;
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  await delay(200);
  const result = await getVehiclesById(id);

  if (!result.success || !result.data) {
    return undefined;
  }

  return result.data;
}

// ------------------------------------------------------------------
// BOOKING FUNCTIONS ( NOW USING REAL BACKEND DATA)
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
