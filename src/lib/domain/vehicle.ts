import { z } from 'zod';
import type { Component } from 'svelte';
import Car from '@lucide/svelte/icons/car';
import Bike from '@lucide/svelte/icons/bike';
import Scooter from '@lucide/svelte/icons/scooter';
import Truck from '@lucide/svelte/icons/truck';
import Van from '@lucide/svelte/icons/van';
import BusFront from '@lucide/svelte/icons/bus-front';
import Tractor from '@lucide/svelte/icons/tractor';
import Sailboat from '@lucide/svelte/icons/sailboat';
import Caravan from '@lucide/svelte/icons/caravan';
import Shapes from '@lucide/svelte/icons/shapes';

/** Standard paint colors offered in the vehicle color picker, before vintage muting. */
export const STANDARD_VEHICLE_COLORS: Array<{ name: string; hex: string }> = [
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Silver', hex: '#c0c0c0' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Red', hex: '#c62828' },
  { name: 'Blue', hex: '#1565c0' },
  { name: 'Navy', hex: '#0d3b66' },
  { name: 'Green', hex: '#2e7d32' },
  { name: 'Yellow', hex: '#f9d71c' },
  { name: 'Orange', hex: '#e65100' },
  { name: 'Brown', hex: '#6d4c41' },
  { name: 'Beige', hex: '#d8c39a' },
  { name: 'Gold', hex: '#cba135' },
  { name: 'Maroon', hex: '#7b1e1e' },
  { name: 'Bronze', hex: '#8c6239' },
  { name: 'Purple', hex: '#6a1b9a' }
];

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
  const num = parseInt(normalized.slice(1), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r: number;
  let g: number;
  let b: number;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function toHexByte(value: number): string {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
}

/**
 * Renders a vehicle's stored paint color as its muted "vintage" accent — same hue, cut
 * saturation and pulled toward a mid lightness — so any custom hex a user enters still
 * matches the app's desaturated palette wherever it's used as an accent.
 */
export function vintageVehicleColor(hex: string | null | undefined): string | null {
  if (!hex || !HEX_COLOR_RE.test(hex)) return hex ?? null;
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const mutedS = s * 0.45;
  const mutedL = l + (0.5 - l) * 0.3;
  const muted = hslToRgb(h, mutedS, mutedL);
  return `#${toHexByte(muted.r)}${toHexByte(muted.g)}${toHexByte(muted.b)}`;
}

/**
 * Vintage-mutes a vehicle color for use as a chart line, but bails to `null` for
 * white/black/gray/silver — those are near-achromatic, and a single static hex can't
 * stay visible against both a light and a dark chart background. Callers should fall
 * back to a theme-aware palette color (e.g. `var(--chart-1)`) when this returns null.
 */
export function vehicleTrendColor(hex: string | null | undefined): string | null {
  if (!hex || !HEX_COLOR_RE.test(hex)) return null;
  const { r, g, b } = hexToRgb(hex);
  const { s } = rgbToHsl(r, g, b);
  if (s < 0.1) return null;
  return vintageVehicleColor(hex);
}

/**
 * A vehicle's vintage-muted color as a badge background, plus a black/white icon class
 * picked for contrast against that specific background. Returns null when no color is
 * set, so callers can fall back to a neutral theme token instead.
 */
export function vehicleAccent(hex: string | null | undefined): {
  background: string;
  iconClass: string;
} | null {
  const muted = vintageVehicleColor(hex);
  if (!muted || !HEX_COLOR_RE.test(muted)) return null;
  const { r, g, b } = hexToRgb(muted);
  const { l } = rgbToHsl(r, g, b);
  return { background: muted, iconClass: l > 0.6 ? 'text-black/70' : 'text-white' };
}

export interface Vehicle {
  id: string | null;
  make: string;
  model: string;
  year: number;
  licensePlate: string | null;
  vin: string | null;
  color: string | null;
  odometer: number | null;
  image?: string | null;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'lpg' | 'cng';
  vehicleType:
    | 'car'
    | 'motorcycle'
    | 'scooter'
    | 'truck'
    | 'van'
    | 'bus'
    | 'farm_vehicle'
    | 'yacht'
    | 'rv'
    | 'other';
  customFields?: Record<string, string> | null;
}

export interface VehicleActivityEntry {
  id: string;
  kind: 'fuel' | 'maintenance' | 'compliance';
  date: string;
  cost?: number | null;
  fuelAmount?: number | null;
  serviceCenter?: string | null;
  documentNumber?: string | null;
}

/** Shape returned by the vehicle hub page's server load (getVehicleSummary) — vehicle plus derived stats. */
export interface VehicleHubSummary extends Vehicle {
  currentOdometer?: number | null;
  overallMileage?: number | null;
  totalFuelLogs?: number;
  totalMaintenanceLogs?: number;
  insuranceValidTill?: string | null;
  insuranceValidityStatus?: 'valid' | 'expired' | 'not_available';
  otherComplianceValidTill?: string | null;
  otherComplianceValidityStatus?: 'valid' | 'expired' | 'not_available';
  upcomingRemindersCount?: number;
  recentActivity?: VehicleActivityEntry[];
}

export const FUEL_TYPES = {
  petrol: 'petrol',
  diesel: 'diesel',
  electric: 'electric',
  lpg: 'lpg',
  cng: 'cng'
} as const;

// Helper function to get localized fuel type label
export function getFuelTypeLabel(fuelType: string, m: any): string {
  switch (fuelType) {
    case 'petrol':
      return m.fuel_type_petrol();
    case 'diesel':
      return m.fuel_type_diesel();
    case 'electric':
      return m.fuel_type_electric();
    case 'lpg':
      return m.fuel_type_lpg();
    case 'cng':
      return m.fuel_type_cng();
    default:
      return m.fuel_type_petrol();
  }
}

export const VEHICLE_TYPES = {
  car: 'car',
  motorcycle: 'motorcycle',
  scooter: 'scooter',
  truck: 'truck',
  van: 'van',
  bus: 'bus',
  farm_vehicle: 'farm_vehicle',
  yacht: 'yacht',
  rv: 'rv',
  other: 'other'
} as const;

const VEHICLE_TYPE_ICONS: Record<string, Component<{ class?: string }>> = {
  car: Car,
  motorcycle: Bike,
  scooter: Scooter,
  truck: Truck,
  van: Van,
  bus: BusFront,
  farm_vehicle: Tractor,
  yacht: Sailboat,
  rv: Caravan,
  other: Shapes
};

export function getVehicleTypeIcon(
  vehicleType: string
): Component<{ class?: string; style?: any }> {
  return VEHICLE_TYPE_ICONS[vehicleType] ?? Car;
}

// Helper function to get localized vehicle type label
export function getVehicleTypeLabel(vehicleType: string, m: any): string {
  switch (vehicleType) {
    case 'car':
      return m.vehicle_type_car();
    case 'motorcycle':
      return m.vehicle_type_motorcycle();
    case 'scooter':
      return m.vehicle_type_scooter();
    case 'truck':
      return m.vehicle_type_truck();
    case 'van':
      return m.vehicle_type_van();
    case 'bus':
      return m.vehicle_type_bus();
    case 'farm_vehicle':
      return m.vehicle_type_farm_vehicle();
    case 'yacht':
      return m.vehicle_type_yacht();
    case 'rv':
      return m.vehicle_type_rv();
    case 'other':
      return m.vehicle_type_other();
    default:
      return m.vehicle_type_car();
  }
}

export const vehicleSchema = z.object({
  id: z.string().nullable(),
  make: z
    .string()
    .min(2, 'It must be more than 1 character.')
    .max(50, 'It must be less than 50 characters.'),

  model: z
    .string()
    .min(2, 'It must be more than 1 character.')
    .max(50, 'It must be less than 50 characters.'),
  year: z
    .number()
    .min(1900, 'It must be after 1900')
    .max(2100, 'It must be before current year.')
    .default(2025),
  licensePlate: z
    .string()
    .min(2, 'It must be more than 1 character.')
    .max(50, 'It must be less than 50 characters.')
    .transform((val) => val.toUpperCase())
    .nullable(),
  vin: z
    .string()
    .min(2, 'It must be more than 1 character.')
    .max(50, 'It must be less than 50 characters.')
    .transform((val) => val.toUpperCase())
    .nullable(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Only hex color codes allowed.')
    .nullable(),
  odometer: z.number().nonnegative().nullable(),
  image: z.string().nullable().optional(),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'lpg', 'cng']).default('petrol'),
  vehicleType: z
    .enum([
      'car',
      'motorcycle',
      'scooter',
      'truck',
      'van',
      'bus',
      'farm_vehicle',
      'yacht',
      'rv',
      'other'
    ])
    .default('car'),
  customFields: z.record(z.string(), z.string()).nullable().optional()
});

export type VehicleSchema = typeof vehicleSchema;
