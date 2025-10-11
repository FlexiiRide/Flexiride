'use server';
import {
  getMyVehicles,
  getPopularVehicles,
  getSearchedVehicles,
  getVehiclesById,
} from './actions/vehicles-action';
import { type User, type Vehicle, type Booking } from './types';

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

// Booking Functions
export async function getBookings(filters: {
  ownerId?: string;
  clientId?: string;
  vehicleId?: string;
}): Promise<Booking[]> {
  await delay(300);
  let bookings = mockBookings as Booking[];
  if (filters.ownerId) {
    bookings = bookings.filter((b) => b.ownerId === filters.ownerId);
  }
  if (filters.clientId) {
    bookings = bookings.filter((b) => b.clientId === filters.clientId);
  }
  if (filters.vehicleId) {
    bookings = bookings.filter((b) => b.vehicleId === filters.vehicleId);
  }
  return bookings;
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  await delay(100);
  const bookings = mockBookings as Booking[];
  return bookings.find((booking) => booking.id === id);
}
