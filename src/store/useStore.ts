import { create } from 'zustand';
import { 
  Property, Stay, Vehicle, PearlEvent, SocialPost, SMEBusiness, SMEProduct,
  UserProfile, UserRole, Transaction, WalletTransaction,
  RecentlyViewed, CompareItem, Notification, ListingStatus,
  BundleItem
} from '../types';

interface AppStore {
  // Data
  properties: Property[];
  stays: Stay[];
  vehicles: Vehicle[];
  events: PearlEvent[];
  socialPosts: SocialPost[];
  smeBusinesses: SMEBusiness[];
  users: Record<string, UserProfile>;
  transactions: Transaction[];
  wallet_transactions: WalletTransaction[];

  // Auth / User
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  updateUserBadges: (userId: string, badges: string[]) => void;
  logout: () => void;

  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  toast: { message: string; type: string; id: number } | null;
  clearToast: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  notifications: Notification[];
  addNotification: (title: string, message: string) => void;
  markNotificationRead: (id: number) => void;
  recentlyViewed: RecentlyViewed[];
  addRecentlyViewed: (item: Omit<RecentlyViewed, "viewedAt">) => void;
  compareItems: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;

  // Trip Bundle
  bundleItems: BundleItem[];
  addBundleItem: (item: BundleItem) => void;
  removeBundleItem: (id: string) => void;
  clearBundle: () => void;

  // Pearl Points (local cache)
  pearlPointsBalance: number;
  setPearlPointsBalance: (n: number) => void;

  // Expat / tourist mode
  isExpatMode: boolean;
  setExpatMode: (v: boolean) => void;

  // CRUD Operations
  addProperty: (property: Omit<Property, 'id' | 'listed' | 'views'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  addStay: (stay: Omit<Stay, 'id' | 'created_at' | 'rating' | 'review_count'>) => void;
  updateStay: (id: string, updates: Partial<Stay>) => void;
  deleteStay: (id: string) => void;

  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'rating' | 'trips'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  addEvent: (event: Omit<PearlEvent, 'id' | 'created_at' | 'tickets_sold'>) => void;
  updateEvent: (id: string, updates: Partial<PearlEvent>) => void;
  deleteEvent: (id: string) => void;

  addSocialPost: (post: Omit<SocialPost, 'id' | 'created_at' | 'likes' | 'comments_count'>) => void;
  likeSocialPost: (id: string) => void;
  updateSocialPost: (id: string, updates: Partial<SocialPost>) => void;
  deleteSocialPost: (id: string) => void;

  addSMEBusiness: (biz: Omit<SMEBusiness, 'id' | 'created_at' | 'verified' | 'products'>) => void;
  updateSMEBusiness: (id: string, updates: Partial<SMEBusiness>) => void;
  addSMEProduct: (bizId: string, product: Omit<SMEProduct, 'id' | 'created_at'>) => void;
  toggleSMEProduct: (bizId: string, productId: string) => void;

  // Global Settings
  globalSettings: {
    stays: { serviceCharge: number; tax: number };
    rentals: { baseKm: number; excessKmRate: number };
    events: { tax: number };
  };
  updateGlobalSettings: (category: 'stays' | 'rentals' | 'events', settings: any) => void;
  language: string;
  setLanguage: (lang: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  exchangeRates: Record<string, number>;
  chatMessages: { id: string, sender: string, text: string, time: string, isVoice?: boolean, translatedText?: string }[];
  addChatMessage: (msg: { sender: string, text: string, isVoice?: boolean }) => void;
}

// Initial Data from PearlHub
const INITIAL_PROPERTIES: Property[] = [
  { id: "P001", owner_id: "U002", property_type: "house", listing_type: "sale", title: "Luxury Villa – Colombo 7", price: 85000000, bedrooms: 5, bathrooms: 4, area_sqft: 4200, location: "Colombo 07", address: "Independence Avenue", lat: 6.9022, lng: 79.8600, images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600"], status: "active", views: 342, listed: "2024-01-15", description: "Stunning 5-bedroom luxury villa in the heart of Colombo 7 with modern finishes, swimming pool, and landscaped garden.", features: ["Pool","Garden","Garage","Security","Solar"], currency: "LKR" },
  { id: "P002", owner_id: "U003", property_type: "apartment", listing_type: "rent", title: "Modern Apartment – Beira Lake", price: 120000, bedrooms: 3, bathrooms: 2, area_sqft: 1800, location: "Colombo 02", lat: 6.9218, lng: 79.8578, images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"], status: "active", views: 215, listed: "2024-01-18", description: "Premium 3-bedroom apartment with panoramic Beira Lake views, fully furnished with modern appliances.", features: ["Lake View","Gym","Pool","Parking","24hr Security"], currency: "LKR", address: "Beira Lake Front" },
  { id: "P003", owner_id: "U003", property_type: "house", listing_type: "sale", title: "Colonial Mansion – Galle", price: 125000000, bedrooms: 6, bathrooms: 5, area_sqft: 5500, location: "Galle Fort", lat: 6.0267, lng: 80.2167, images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"], status: "active", views: 128, listed: "2024-02-01", description: "Authentic colonial mansion within the UNESCO World Heritage Galle Fort.", features: ["Heritage","High Ceilings","Courtyard"], currency: "LKR", address: "Church Street, Galle Fort" },
];

const INITIAL_STAYS: Stay[] = [
  { id: "S001", provider_id: "U005", name: "Shangri-La Colombo", location: "Colombo 01", lat: 6.9331, lng: 79.8486, price_per_night: 45000, currency: "LKR", images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"], amenities: ["Pool","Spa","5 Restaurants","Beach","Gym"], approved: true, description: "Iconic 5-star luxury on Colombo waterfront.", stars: 5, rating: 4.8, review_count: 124, status: "active", bedrooms: 1, bathrooms: 1, max_guests: 2, created_at: "2024-01-01", stay_type: "hotel", rooms: 1 },
  { id: "S002", provider_id: "U005", name: "Cinnamon Grand", location: "Colombo 03", lat: 6.9180, lng: 79.8480, price_per_night: 32000, currency: "LKR", images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600"], amenities: ["Pool","Grand Ballroom","Tea Lounge"], approved: true, description: "The premier business hotel in Colombo.", stars: 5, rating: 4.6, review_count: 98, status: "active", bedrooms: 1, bathrooms: 1, max_guests: 2, created_at: "2024-01-05", stay_type: "hotel", rooms: 1 },
  { id: "S003", provider_id: "U005", name: "Amari Galle", location: "Galle", lat: 6.0531, lng: 80.1986, price_per_night: 28000, currency: "LKR", images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600"], amenities: ["Beachfront","Rooftop Bar"], approved: true, description: "Modern beachfront resort in Galle.", stars: 5, rating: 4.5, review_count: 76, status: "active", bedrooms: 1, bathrooms: 1, max_guests: 2, created_at: "2024-01-10", stay_type: "resort", rooms: 1 },
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: "V001", provider_id: "U008", vehicle_type: "car", make: "Toyota", model: "Prius", year: 2022, price_per_day: 6500, currency: "LKR", seats: 5, with_driver: false, insurance_included: true, location: "Colombo", lat: 6.9147, lng: 79.8527, images: ["https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600"], fuel: "Hybrid", rating: 4.7, trips: 234, is_fleet: false, status: "active", description: "Efficient hybrid car for city travel.", features: ["AC", "Bluetooth", "Hybrid"], created_at: "2024-01-15", title: "Eco-Friendly Toyota Prius" },
  { id: "V002", provider_id: "U008", vehicle_type: "van", make: "Toyota", model: "Hiace", year: 2021, price_per_day: 12500, currency: "LKR", seats: 12, with_driver: true, insurance_included: true, location: "Colombo", lat: 6.9140, lng: 79.8520, images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"], fuel: "Diesel", rating: 4.8, trips: 156, is_fleet: true, status: "active", description: "Spacious van for group travel with professional driver.", features: ["AC", "Dual AC", "DVD"], created_at: "2024-01-20", title: "Luxury Passenger Van" },
  { id: "V003", provider_id: "U008", vehicle_type: "suv", make: "Mitsubishi", model: "Montero", year: 2019, price_per_day: 25000, currency: "LKR", seats: 7, with_driver: false, insurance_included: true, location: "Colombo", lat: 6.9150, lng: 79.8530, images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600"], fuel: "Diesel", rating: 4.9, trips: 88, is_fleet: false, status: "active", description: "Luxury 4x4 SUV for premium off-road comfort.", features: ["4WD", "Sunroof", "Leather"], created_at: "2024-01-25", title: "Premium Montero SUV" },
];

const INITIAL_EVENTS: PearlEvent[] = [
  { id: "E001", provider_id: "U006", category: "cinema", title: "Oppenheimer – IMAX Re-Release", venue: "Scope Cinemas Colombo", location: "Colombo 03", lat: 6.8901, lng: 79.8540, date: "2024-03-15", time: "19:30", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600", prices: { standard: 900, premium: 1400, vip: 2200 }, totalSeats: 180, availableSeats: 166, tickets_sold: 14, has_seat_map: true, qr_enabled: true, tags: ["IMAX", "Nolan"], status: "active", description: "Christopher Nolan's masterpiece returns in stunning IMAX.", created_at: "2024-03-01" },
  { id: "E002", provider_id: "U006", category: "concert", title: "Live at the Park – Sri Lankan Artists", venue: "Viharamahadevi Park", location: "Colombo 07", lat: 6.9128, lng: 79.8612, date: "2024-04-10", time: "18:00", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=600", prices: { standard: 1500, vip: 5000 }, totalSeats: 500, availableSeats: 450, tickets_sold: 50, has_seat_map: false, qr_enabled: true, tags: ["Music", "Outdoors"], status: "active", description: "An evening of soulful music under the stars.", created_at: "2024-03-05" },
];

const INITIAL_USERS: Record<string, UserProfile> = {
  admin: { id: "U-ADM", name: "System Admin", email: "admin@demo.com", role: "admin", balance: 1000000, verified: true },
  customer: { id: "U-CUST", name: "Guest Customer", email: "customer@demo.com", role: "customer", balance: 50000, verified: true },
  provider: { id: "U-PROV", name: "Demo Provider", email: "provider@demo.com", role: "vehicle_provider", balance: 25000, verified: true },
  owner: { id: "U-OWN", name: "Property Owner", email: "owner@demo.com", role: "owner", balance: 150000, verified: true },
  broker: { id: "U-BROK", name: "Licensed Broker", email: "broker@demo.com", role: "broker", balance: 85000, verified: true },
  stay_provider: { id: "U-STAY", name: "Stay Manager", email: "stay@demo.com", role: "stay_provider", balance: 45000, verified: true },
  vehicle_provider: { id: "U-VEH", name: "Fleet Manager", email: "vehicle@demo.com", role: "vehicle_provider", balance: 35000, verified: true },
  event_provider: { id: "U-EVT", name: "Event Curator", email: "event@demo.com", role: "event_provider", balance: 22000, verified: true },
  sme: { id: "U-SME", name: "SME Operator", email: "sme@demo.com", role: "sme", balance: 18000, verified: true },
};

export const useStore = create<AppStore>((set) => ({
  // Data
  properties: INITIAL_PROPERTIES,
  stays: INITIAL_STAYS,
  vehicles: INITIAL_VEHICLES,
  events: INITIAL_EVENTS,
  socialPosts: [],
  smeBusinesses: [],
  globalSettings: {
    stays: { serviceCharge: 0.05, tax: 0.10 },
    rentals: { baseKm: 100, excessKmRate: 325 },
    events: { tax: 0.15 }
  },
  updateGlobalSettings: (category, settings) => set((state) => ({
    globalSettings: {
      ...state.globalSettings,
      [category]: { ...state.globalSettings[category], ...settings }
    }
  })),
  users: INITIAL_USERS,
  transactions: [],
  wallet_transactions: [],

  // Auth
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  userRole: "customer",
  setUserRole: (role) => set({ userRole: role }),
  updateUserBadges: (userId, badges) => set((state) => {
    const updatedUsers = { ...state.users };
    if (updatedUsers[userId]) {
      updatedUsers[userId] = { ...updatedUsers[userId], verification_badges: badges };
    }
    return { users: updatedUsers };
  }),
  logout: () => set({ currentUser: null, userRole: "customer" }),

  // UI Features
  toast: null,
  showToast: (message, type = "success") => set({ toast: { message, type, id: Date.now() } }),
  clearToast: () => set({ toast: null }),
  favorites: [],
  toggleFavorite: (id) => set((state) => ({
    favorites: state.favorites.includes(id) 
      ? state.favorites.filter(f => f !== id) 
      : [...state.favorites, id]
  })),
  notifications: [
    { id: 1, title: "Welcome to Pearl Hub!", message: "Explore properties, stays, vehicles and events across Sri Lanka.", read: false, time: "Just now" }
  ],
  addNotification: (title, message) => set((state) => ({
    notifications: [{ id: Date.now(), title, message, read: false, time: "Just now" }, ...state.notifications]
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  recentlyViewed: [],
  addRecentlyViewed: (item) => set((state) => {
    const filtered = state.recentlyViewed.filter(r => r.id !== item.id);
    return { recentlyViewed: [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, 10) };
  }),
  compareItems: [],
  addToCompare: (item) => set((state) => {
    if (state.compareItems.find(c => c.id === item.id) || state.compareItems.length >= 3) return state;
    return { compareItems: [...state.compareItems, item] };
  }),
  removeFromCompare: (id) => set((state) => ({
    compareItems: state.compareItems.filter(c => c.id !== id)
  })),
  clearCompare: () => set({ compareItems: [] }),

  // Trip Bundle
  bundleItems: [],
  addBundleItem: (item) => set((state) => {
    if (state.bundleItems.find(b => b.id === item.id)) return state;
    if (state.bundleItems.length >= 10) return state;
    return { bundleItems: [...state.bundleItems, item] };
  }),
  removeBundleItem: (id) => set((state) => ({
    bundleItems: state.bundleItems.filter(b => b.id !== id)
  })),
  clearBundle: () => set({ bundleItems: [] }),

  // Pearl Points
  pearlPointsBalance: 0,
  setPearlPointsBalance: (n) => set({ pearlPointsBalance: n }),

  // Expat mode
  isExpatMode: false,
  setExpatMode: (v) => set({ isExpatMode: v }),

  // CRUD
  addProperty: (prop) => set((state) => ({
    properties: [{ ...prop, id: `P${Date.now()}`, listed: new Date().toISOString(), views: 0 } as Property, ...state.properties]
  })),
  updateProperty: (id, updates) => set((state) => ({
    properties: state.properties.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deleteProperty: (id) => set((state) => ({
    properties: state.properties.filter(p => p.id !== id)
  })),

  addStay: (stay) => set((state) => ({
    stays: [{ ...stay, id: `S${Date.now()}`, created_at: new Date().toISOString(), rating: 0, review_count: 0 } as Stay, ...state.stays]
  })),
  updateStay: (id, updates) => set((state) => ({
    stays: state.stays.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  deleteStay: (id) => set((state) => ({
    stays: state.stays.filter(s => s.id !== id)
  })),

  addVehicle: (vehicle) => set((state) => ({
    vehicles: [{ ...vehicle, id: `V${Date.now()}`, created_at: new Date().toISOString(), rating: 0, trips: 0 } as Vehicle, ...state.vehicles]
  })),
  updateVehicle: (id, updates) => set((state) => ({
    vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
  })),
  deleteVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.filter(v => v.id !== id)
  })),

  addEvent: (event) => set((state) => ({
    events: [{ ...event, id: `E${Date.now()}`, created_at: new Date().toISOString(), tickets_sold: 0 } as PearlEvent, ...state.events]
  })),
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map(e => e.id === id ? { ...e, ...updates } : e)
  })),
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter(e => e.id !== id)
  })),

  addSocialPost: (post) => set((state) => ({
    socialPosts: [{ ...post, id: `SP${Date.now()}`, created_at: new Date().toISOString(), likes: 0, comments_count: 0 } as SocialPost, ...state.socialPosts]
  })),
  likeSocialPost: (id) => set((state) => ({
    socialPosts: state.socialPosts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p)
  })),
  updateSocialPost: (id, updates) => set((state) => ({
    socialPosts: state.socialPosts.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deleteSocialPost: (id) => set((state) => ({
    socialPosts: state.socialPosts.filter(p => p.id !== id)
  })),

  addSMEBusiness: (biz) => set((state) => ({
    smeBusinesses: [{ ...biz, id: `SME${Date.now()}`, created_at: new Date().toISOString(), verified: false, products: [] } as SMEBusiness, ...state.smeBusinesses]
  })),
  updateSMEBusiness: (id, updates) => set((state) => ({
    smeBusinesses: state.smeBusinesses.map(b => b.id === id ? { ...b, ...updates } : b)
  })),
  addSMEProduct: (bizId, product) => set((state) => ({
    smeBusinesses: state.smeBusinesses.map(b => b.id === bizId ? { ...b, products: [...(b.products || []), { ...product, id: `PRD${Date.now()}`, created_at: new Date().toISOString() }] } : b)
  })),
  toggleSMEProduct: (bizId, productId) => set((state) => ({
    smeBusinesses: state.smeBusinesses.map(b => b.id === bizId ? { ...b, products: b.products?.map(p => p.id === productId ? { ...p, is_active: !p.is_active } : p) } : b)
  })),

  // Multilingual & Chat
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  currency: 'LKR',
  setCurrency: (currency) => set({ currency }),
  exchangeRates: {
    LKR: 1,
    USD: 0.0031,
    EUR: 0.0028,
    RUB: 0.28,
  },
  chatMessages: [
    { id: '1', sender: 'Support', text: 'Welcome to Pearl Hub! How can we assist you today?', time: '09:00' }
  ],
  addChatMessage: (msg) => set((state) => ({
    chatMessages: [...state.chatMessages, { ...msg, id: Date.now().toString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
  })),
}));
