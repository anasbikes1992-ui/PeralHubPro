/**
 * Pearl Hub — Central Zod validation schemas
 * Used across listing modals and forms for consistent server+client validation.
 */
import { z } from "zod";

const SRI_LANKA_LAT = z.number().min(5.9).max(10.0);
const SRI_LANKA_LNG = z.number().min(79.5).max(82.0);

// ── Common ─────────────────────────────────────────────────
export const imageUrlsSchema = z.array(z.string().url()).max(10);

// ── Property listing ───────────────────────────────────────
export const propertyListingSchema = z.object({
  title:       z.string().min(5, "Title must be at least 5 characters").max(120).trim(),
  description: z.string().max(2000).trim(),
  type:        z.enum(["sale", "rent", "lease", "wanted"]),
  subtype:     z.enum(["house", "apartment", "land", "commercial", "villa", "office"]),
  price:       z.number().positive("Price must be a positive number").max(1_000_000_000),
  beds:        z.number().int().min(0).max(50),
  baths:       z.number().int().min(0).max(50),
  area:        z.number().min(0).max(100_000),
  location:    z.string().min(2).max(100).trim(),
  lat:         SRI_LANKA_LAT,
  lng:         SRI_LANKA_LNG,
  images:      imageUrlsSchema.optional(),
});
export type PropertyListingInput = z.infer<typeof propertyListingSchema>;

// ── Stay listing ───────────────────────────────────────────
export const stayListingSchema = z.object({
  name:            z.string().min(3).max(120).trim(),
  description:     z.string().max(2000).trim(),
  stay_type:       z.string().min(1).max(50),
  location:        z.string().min(2).max(100).trim(),
  lat:             SRI_LANKA_LAT,
  lng:             SRI_LANKA_LNG,
  price_per_night: z.number().positive().max(10_000_000),
  currency:        z.string().length(3),
  bedrooms:        z.number().int().min(0).max(100),
  bathrooms:       z.number().int().min(0).max(100),
  max_guests:      z.number().int().min(1).max(500),
  stars:           z.number().int().min(1).max(5),
  amenities:       z.array(z.string()).max(50),
  images:          imageUrlsSchema.optional(),
});
export type StayListingInput = z.infer<typeof stayListingSchema>;

// ── Vehicle listing ────────────────────────────────────────
export const vehicleListingSchema = z.object({
  title:            z.string().min(3).max(120).trim(),
  description:      z.string().max(2000).trim(),
  vehicle_type:     z.string().min(1).max(50),
  make:             z.string().min(1).max(60).trim(),
  model:            z.string().min(1).max(60).trim(),
  year:             z.number().int().min(1980).max(new Date().getFullYear() + 1),
  seats:            z.number().int().min(1).max(100),
  price_per_day:    z.number().positive().max(1_000_000),
  currency:         z.string().length(3),
  with_driver:      z.boolean(),
  insurance_included: z.boolean(),
  location:         z.string().min(2).max(100).trim(),
  lat:              SRI_LANKA_LAT,
  lng:              SRI_LANKA_LNG,
  fuel:             z.string().max(30),
  features:         z.array(z.string()).max(30),
  images:           imageUrlsSchema.optional(),
});
export type VehicleListingInput = z.infer<typeof vehicleListingSchema>;

// ── Event listing ──────────────────────────────────────────
export const eventListingSchema = z.object({
  title:          z.string().min(3).max(120).trim(),
  description:    z.string().max(2000).trim(),
  category:       z.string().min(1).max(50),
  venue:          z.string().min(2).max(200).trim(),
  location:       z.string().min(2).max(100).trim(),
  lat:            SRI_LANKA_LAT,
  lng:            SRI_LANKA_LNG,
  date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  time:           z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  price_standard: z.number().nonnegative().optional(),
  price_premium:  z.number().nonnegative().optional(),
  price_vip:      z.number().nonnegative().optional(),
  total_seats:    z.number().int().min(1).max(100_000).optional(),
  images:         imageUrlsSchema.optional(),
  tags:           z.array(z.string()).max(20).optional(),
});
export type EventListingInput = z.infer<typeof eventListingSchema>;

// ── Inquiry / contact ─────────────────────────────────────
export const inquirySchema = z.object({
  sender_name:  z.string().min(2).max(100).trim(),
  sender_email: z.string().email(),
  sender_phone: z.string().max(15).optional(),
  message:      z.string().min(10, "Message must be at least 10 characters").max(1000).trim(),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

// ── Review ────────────────────────────────────────────────
export const reviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000).trim(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
