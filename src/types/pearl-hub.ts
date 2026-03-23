// Pearl Hub Types
export interface Property {
  id: string;
  type: "sale" | "rent" | "lease";
  subtype: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  location: string;
  lat: number;
  lng: number;
  image: string;
  owner: string;
  status: string;
  views: number;
  listed: string;
  description: string;
  amenities: string[];
}

export interface Stay {
  id: string;
  type: string;
  stars: number;
  name: string;
  location: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  rooms: number;
  rating: number;
  image: string;
  amenities: string[];
  approved: boolean;
  description: string;
}

export interface Vehicle {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  price: number;
  priceUnit: string;
  seats: number;
  ac: boolean;
  driver: string;
  location: string;
  lat: number;
  lng: number;
  image: string;
  fuel: string;
  rating: number;
  trips: number;
}

export interface PearlEvent {
  id: string;
  category: string;
  title: string;
  venue: string;
  location: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  image: string;
  prices: Record<string, number>;
  seats: { rows: number; cols: number; booked: number[] };
  totalSeats: number;
  availableSeats: number;
  description: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  user: string;
  date: string;
  status: string;
  ref: string;
}

export interface WalletTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "commission" | "refund" | "fee";
  amount: number;
  description: string;
  date: string;
  status: "pending" | "completed" | "failed";
  ref: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  joined?: string;
  bookings?: number;
  spent?: number;
  listings?: number;
  revenue?: number;
  nic?: string;
  verified?: boolean;
  membership?: string;
  memberships_remaining?: number;
  balance?: number;
  wallet_transactions?: WalletTransaction[];
}

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  location: string;
  price?: number;
  emoji?: string;
  type: string;
  rating?: number;
}

export interface AppData {
  properties: Property[];
  stays: Stay[];
  vehicles: Vehicle[];
  events: PearlEvent[];
  bookings: unknown[];
  users: Record<string, UserProfile>;
  transactions: Transaction[];
  wallet_transactions: WalletTransaction[];
}

export type UserRole = "customer" | "owner" | "broker" | "admin" | "stay_provider" | "event_organizer" | "vehicle_provider" | "sme";
