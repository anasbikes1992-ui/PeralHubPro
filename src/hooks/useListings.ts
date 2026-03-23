/**
 * Pearl Hub — React Query hooks for fetching listings from Supabase.
 *
 * Strategy: Supabase is the source of truth for all listing data.
 * The Zustand store is used only for UI state (favorites, compare, toasts).
 *
 * Usage:
 *   const { data: stays, isLoading } = useStays({ location: "Colombo" });
 *   const { data: vehicles }         = useVehicles();
 *   const { data: events }           = useEvents();
 *   const { data: properties }       = useProperties();
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Query key factory ─────────────────────────────────────
export const listingKeys = {
  all:        ["listings"]                       as const,
  stays:      (f?: StayFilters)  => ["stays",  f] as const,
  vehicles:   (f?: VehicleFilters) => ["vehicles", f] as const,
  events:     (f?: EventFilters) => ["events", f]  as const,
  properties: (f?: PropertyFilters) => ["properties", f] as const,
  providerStays:     (uid: string) => ["provider-stays",     uid] as const,
  providerVehicles:  (uid: string) => ["provider-vehicles",  uid] as const,
  providerEvents:    (uid: string) => ["provider-events",    uid] as const,
  providerProperties:(uid: string) => ["provider-properties", uid] as const,
  bookings:   (uid: string) => ["bookings", uid] as const,
};

// ── Filter types ──────────────────────────────────────────
export interface StayFilters {
  location?: string;
  stay_type?: string;
  maxPrice?: number;
  minRating?: number;
  amenity?: string;
}

export interface VehicleFilters {
  location?: string;
  vehicle_type?: string;
  maxPrice?: number;
  with_driver?: boolean;
}

export interface EventFilters {
  location?: string;
  category?: string;
}

export interface PropertyFilters {
  location?: string;
  type?: string;
  subtype?: string;
  maxPrice?: number;
}

// ── Stays ─────────────────────────────────────────────────
export function useStays(filters?: StayFilters) {
  return useQuery({
    queryKey: listingKeys.stays(filters),
    queryFn: async () => {
      let query = (supabase as any)
        .from("stays_listings")
        .select("*")
        .eq("moderation_status", "approved")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (filters?.location) query = query.ilike("location", `%${filters.location}%`);
      if (filters?.stay_type && filters.stay_type !== "all") query = query.eq("stay_type", filters.stay_type);
      if (filters?.maxPrice) query = query.lte("price_per_night", filters.maxPrice);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ── Vehicles ──────────────────────────────────────────────
export function useVehicles(filters?: VehicleFilters) {
  return useQuery({
    queryKey: listingKeys.vehicles(filters),
    queryFn: async () => {
      let query = (supabase as any)
        .from("vehicles_listings")
        .select("*")
        .eq("moderation_status", "approved")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (filters?.location)     query = query.ilike("location", `%${filters.location}%`);
      if (filters?.vehicle_type && filters.vehicle_type !== "all") query = query.eq("vehicle_type", filters.vehicle_type);
      if (filters?.maxPrice)     query = query.lte("price_per_day", filters.maxPrice);
      if (filters?.with_driver !== undefined) query = query.eq("with_driver", filters.with_driver);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 3 * 60 * 1000,
  });
}

// ── Events ────────────────────────────────────────────────
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: listingKeys.events(filters),
    queryFn: async () => {
      let query = (supabase as any)
        .from("events_listings")
        .select("*")
        .eq("moderation_status", "approved")
        .eq("active", true)
        .gte("event_date", new Date().toISOString().split("T")[0]) // Future events only
        .order("event_date", { ascending: true });

      if (filters?.location) query = query.ilike("location", `%${filters.location}%`);
      if (filters?.category && filters.category !== "all") query = query.eq("category", filters.category);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 3 * 60 * 1000,
  });
}

// ── Properties ────────────────────────────────────────────
export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: listingKeys.properties(filters),
    queryFn: async () => {
      let query = (supabase as any)
        .from("properties_listings")
        .select("*")
        .eq("moderation_status", "approved")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (filters?.location) query = query.ilike("location", `%${filters.location}%`);
      if (filters?.type && filters.type !== "all") query = query.eq("type", filters.type);
      if (filters?.subtype) query = query.eq("subtype", filters.subtype);
      if (filters?.maxPrice) query = query.lte("price", filters.maxPrice);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 3 * 60 * 1000,
  });
}

// ── Provider: own listings ────────────────────────────────
export function useProviderStays(userId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.providerStays(userId ?? ""),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("stays_listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useProviderVehicles(userId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.providerVehicles(userId ?? ""),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("vehicles_listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useProviderEvents(userId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.providerEvents(userId ?? ""),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("events_listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useProviderProperties(userId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.providerProperties(userId ?? ""),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("properties_listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

// ── User bookings ─────────────────────────────────────────
export function useUserBookings(userId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.bookings(userId ?? ""),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

// ── Mutation: invalidate provider listings after create/update/delete ─────
export function useInvalidateListings() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["stays"] });
    qc.invalidateQueries({ queryKey: ["vehicles"] });
    qc.invalidateQueries({ queryKey: ["events"] });
    qc.invalidateQueries({ queryKey: ["properties"] });
    qc.invalidateQueries({ queryKey: ["provider-stays"] });
    qc.invalidateQueries({ queryKey: ["provider-vehicles"] });
    qc.invalidateQueries({ queryKey: ["provider-events"] });
    qc.invalidateQueries({ queryKey: ["provider-properties"] });
  };
}
