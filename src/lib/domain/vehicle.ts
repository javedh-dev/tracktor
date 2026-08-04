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
    .regex(/^(#[0-9a-fA-F]{3})|(#[0-9a-fA-F]{6})$/, 'Only hex color codes allowed.')
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
