'use server';
import { getMyVehicles } from './actions/vehicles-action';
import { type User, type EnrichedBooking, type Vehicle, type Booking } from './types';
import { getMyBookings, getBookingsForOwner } from './actions/bookings-action';
import { getUserById } from './auth';
import { getVehicleById } from './actions/vehicles-action';

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

const mockBookings: Booking[] = [
  {
    id: 'b_1',
    vehicleId: 'v_100',
    clientId: 'u_2',
    ownerId: 'u_1',
    from: '2025-09-22T09:00:00.000Z',
    to: '2025-09-22T15:00:00.000Z',
    totalPrice: 39.0,
    status: 'approved',
    paymentMethod: 'cash',
    pickupDetails: 'Meet at parking spot A',
  },
  {
    id: 'b_2',
    vehicleId: 'v_101',
    clientId: 'u_4',
    ownerId: 'u_3',
    from: '2025-09-21T10:00:00.000Z',
    to: '2025-09-21T18:00:00.000Z',
    totalPrice: 20.0,
    status: 'requested',
    paymentMethod: 'cash',
    pickupDetails: '',
  },
  {
    id: 'b_3',
    vehicleId: 'v_102',
    clientId: 'u_2',
    ownerId: 'u_1',
    from: '2025-09-27T10:00:00.000Z',
    to: '2025-09-28T18:00:00.000Z',
    totalPrice: 70.0,
    status: 'rejected',
    paymentMethod: 'cash',
    pickupDetails: '',
  },
  {
    id: 'b_4',
    vehicleId: 'v_100',
    clientId: 'u_4',
    ownerId: 'u_1',
    from: '2025-09-25T11:00:00.000Z',
    to: '2025-09-25T13:00:00.000Z',
    totalPrice: 13.0,
    status: 'cancelled',
    paymentMethod: 'cash',
    pickupDetails: '',
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

// export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
//   await delay(200);
//   const vehicles = await getVehicles();
//   return vehicles.find((vehicle) => vehicle.id === id);
// }

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
