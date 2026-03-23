// ─────────────────────────────────────────────
// USER ROLES & AUTHENTICATION
// ─────────────────────────────────────────────
export type UserRole =
  | 'admin'
  | 'stay_provider'
  | 'vehicle_provider'
  | 'event_provider'
  | 'owner' // property owner
  | 'broker' // property broker
  | 'sme' // sme business
  | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  joined?: string;
  verified: boolean;
  balance: number;
  nic?: string;
  membership?: string;
  memberships_remaining?: number;
  revenue?: number;
  listings?: number;
  spent?: number;
  bookings?: number;
  verification_badges?: string[];
}

// ─────────────────────────────────────────────
// LISTING STATUS
// ─────────────────────────────────────────────
export type ListingStatus = 'active' | 'paused' | 'off' | 'pending' | 'rejected';

// ─────────────────────────────────────────────
// COMMON TYPES
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// PROPERTIES
// ─────────────────────────────────────────────
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'villa' | 'office';
export type PropertyListingType = 'sale' | 'rent' | 'lease' | 'wanted';

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: PropertyListingType;
  location: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  features: string[];
  status: ListingStatus;
  views: number;
  listed: string;
  admin_note?: string;
}

// ─────────────────────────────────────────────
// STAYS
// ─────────────────────────────────────────────
export interface Stay {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  price_per_night: number;
  currency: string;
  images: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  stars: number;
  rating: number;
  review_count: number;
  status: ListingStatus;
  stay_type: string;
  rooms: number;
  approved: boolean;
  admin_note?: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// VEHICLES
// ─────────────────────────────────────────────
export type VehicleType = 'car' | 'van' | 'bus' | 'tuk_tuk' | 'motorcycle' | 'scooter' | 'suv' | 'minibus' | 'luxury_coach' | 'jeep';

export interface Vehicle {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  vehicle_type: VehicleType;
  make: string;
  model: string;
  year: number;
  seats: number;
  price_per_day: number;
  currency: string;
  images: string[];
  features: string[];
  with_driver: boolean;
  insurance_included: boolean;
  location: string;
  lat: number;
  lng: number;
  fuel: string;
  rating: number;
  trips: number;
  is_fleet: boolean;
  fleet_size?: number;
  status: ListingStatus;
  admin_note?: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────
export type EventCategory = 'cultural' | 'music' | 'food' | 'sports' | 'business' | 'adventure' | 'religious' | 'art' | 'educational' | 'cinema' | 'concert';

export interface PearlEvent {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  venue: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  image: string; // PearlHub uses single image mostly
  images?: string[]; // pearlhub2 uses array
  prices: Record<string, number>;
  seats?: { rows: number; cols: number; booked: number[] };
  totalSeats: number;
  availableSeats: number;
  tickets_sold: number;
  has_seat_map: boolean;
  qr_enabled: boolean;
  tags: string[];
  status: ListingStatus;
  admin_note?: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// SOCIAL / COMMUNITY
// ─────────────────────────────────────────────
export interface SocialPost {
  id: string;
  author_id: string;
  content: string;
  images: string[];
  location?: string;
  lat?: number;
  lng?: number;
  tags: string[];
  likes: number;
  comments_count: number;
  status: ListingStatus;
  created_at: string;
}

// ─────────────────────────────────────────────
// SME BUSINESS
// ─────────────────────────────────────────────
export interface SMEBusiness {
  id: string;
  owner_id: string;
  business_name: string;
  description: string;
  category: string;
  location: string;
  lat?: number;
  lng?: number;
  phone: string;
  email: string;
  website?: string;
  images: string[];
  verified: boolean;
  status: ListingStatus;
  admin_note?: string;
  created_at: string;
  products?: SMEProduct[];
}

export interface SMEProduct {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity_available: number;
  images: string[];
  is_active: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────
// TRANSACTIONS & WALLET
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────
export interface AppData {
  properties: Property[];
  stays: Stay[];
  vehicles: Vehicle[];
  events: PearlEvent[];
  socialPosts: SocialPost[];
  smeBusinesses: SMEBusiness[];
  users: Record<string, UserProfile>;
  transactions: Transaction[];
  wallet_transactions: WalletTransaction[];
}

export interface RecentlyViewed {
  id: string;
  title: string;
  type: "property" | "stay" | "vehicle" | "event";
  price?: number;
  image: string;
  location: string;
  viewedAt: number;
}

export interface CompareItem {
  id: string;
  title: string;
  itemType: string;
  location: string;
  price?: number;
  priceUnit?: string;
  rating?: number;
  subtype?: string;
  details?: string;
  features?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  time: string;
}

// ─────────────────────────────────────────────
// TRIP BUNDLE
// ─────────────────────────────────────────────
export interface BundleItem {
  id: string;
  type: "stay" | "vehicle" | "event";
  title: string;
  price: number;
  currency: string;
  image?: string;
  dateFrom?: string;
  dateTo?: string;
  quantity?: number;
  details?: string;
}

// ─────────────────────────────────────────────
// PROVIDER TIERS
// ─────────────────────────────────────────────
export type ProviderTier = "standard" | "verified" | "pro" | "elite";

export const TIER_LABELS: Record<ProviderTier, { label: string; icon: string; color: string; minBookings: number; minRating: number }> = {
  standard: { label: "Standard",  icon: "●", color: "text-mist",        minBookings: 0,   minRating: 0   },
  verified: { label: "Verified",  icon: "✓", color: "text-blue-400",    minBookings: 5,   minRating: 0   },
  pro:      { label: "Pro",       icon: "★", color: "text-primary",     minBookings: 50,  minRating: 4.5 },
  elite:    { label: "Elite",     icon: "♛", color: "text-emerald-400", minBookings: 100, minRating: 4.8 },
};
