export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'client';
  avatarUrl: string;
  passwordHash: string; // For mock auth
};

export type Vehicle = {
  id: string;
  ownerId: string;
  title: string;
  type: 'car' | 'bike';
  pricePerHour: number;
  pricePerDay: number;
  images: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  availableRanges: {
    from: string; // ISO string
    to: string; // ISO string
  }[];
  description: string;
  status: 'active' | 'inactive';
};

export type Booking = {
  id: string;
  vehicleId: string;
  clientId: string;
  ownerId: string;
  from: string; // ISO string
  to: string; // ISO string
  totalPrice: number;
  status: 'requested' | 'approved' | 'rejected' | 'cancelled';
  paymentMethod: 'cash';
  pickupDetails: string;
};
