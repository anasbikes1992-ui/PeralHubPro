import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from 'date-fns';
import { UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'LKR'): string {
  const symbols: Record<string, string> = {
    LKR: 'Rs.', USD: '$', EUR: '€', GBP: '£', RUB: '₽', CNY: '¥', INR: '₹',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}

export function convertPrice(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (!rates || !rates[from] || !rates[to]) return amount;
  return (amount / rates[from]) * rates[to];
}

export function formatDate(date: string | Date): string {
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
}

export function formatDateRange(start: string, end: string): string {
  try {
    return `${format(new Date(start), 'dd MMM')} – ${format(new Date(end), 'dd MMM yyyy')}`;
  } catch {
    return 'Invalid Date Range';
  }
}

export function timeAgo(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function truncate(text: string, length = 120): string {
  return text.length > length ? text.slice(0, length) + '…' : text;
}

export function obfuscateEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}

export const PERMISSIONS = {
  canListStay: (role: UserRole) => ['admin', 'stay_provider'].includes(role),
  canListVehicle: (role: UserRole) => ['admin', 'vehicle_provider'].includes(role),
  canListEvent: (role: UserRole) => ['admin', 'event_provider'].includes(role),
  canListProperty: (role: UserRole) => ['admin', 'owner', 'broker'].includes(role),
  canPostWanted: (role: UserRole) => ['admin', 'owner', 'broker', 'customer'].includes(role),
  canRegisterSME: (role: UserRole) => ['sme', 'admin'].includes(role),
  isAdmin: (role: UserRole) => role === 'admin',
  isProvider: (role: UserRole) => role !== 'customer',
};

export const SRI_LANKA_LOCATIONS = [
  'Colombo', 'Kandy', 'Galle', 'Negombo', 'Trincomalee',
  'Jaffna', 'Anuradhapura', 'Polonnaruwa', 'Sigiriya',
  'Ella', 'Nuwara Eliya', 'Mirissa', 'Bentota', 'Hikkaduwa',
  'Arugam Bay', 'Pinnawala', 'Dambulla', 'Matara', 'Hambantota',
  'Batticaloa', 'Ampara', 'Ratnapura', 'Badulla', 'Kurunegala',
];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
