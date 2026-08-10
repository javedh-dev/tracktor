import type { FuelLog } from '$lib/domain/fuel';
import type { DataPoint } from '$lib/domain/shared';
import type { Vehicle } from '$lib/domain/vehicle';
import { vehicleTrendColor } from '$lib/domain/vehicle';
import { fuelLogStore } from './fuel-log.svelte';
import { vehicleStore } from './vehicle.svelte';

const calculateCostData = (logs: FuelLog[]) => {
  return logs
    .filter((log) => log.cost)
    .map((log) => {
      return {
        x: new Date(log.date),
        y: log.cost
      };
    })
    .sort((a, b) => a.x.getTime() - b.x.getTime());
};

const calculateMileageData = (logs: FuelLog[]) => {
  return logs
    .filter((log) => log.mileage)
    .map((log) => {
      return {
        x: new Date(log.date),
        y: log.mileage || 0
      };
    })
    .sort((a, b) => a.x.getTime() - b.x.getTime());
};

export const calculateFuelAmountData = (logs: FuelLog[]) => {
  return logs
    .filter((log) => log.fuelAmount)
    .map((log) => {
      return {
        x: new Date(log.date),
        y: log.fuelAmount
      };
    })
    .sort((a, b) => a.x.getTime() - b.x.getTime());
};

export interface VehicleTrendSeries {
  vehicleId: string;
  label: string;
  fuelType: Vehicle['fuelType'];
  color: string | null;
  data: DataPoint[];
}

const groupByVehicle = (
  logs: FuelLog[],
  calculate: (logs: FuelLog[]) => DataPoint[]
): VehicleTrendSeries[] => {
  const byVehicle = new Map<string, FuelLog[]>();
  for (const log of logs) {
    const group = byVehicle.get(log.vehicleId);
    if (group) {
      group.push(log);
    } else {
      byVehicle.set(log.vehicleId, [log]);
    }
  }

  return Array.from(byVehicle.entries()).map(([vehicleId, vehicleLogs]) => {
    const vehicle = vehicleStore.vehicles?.find((v) => v.id === vehicleId);
    const label = vehicle
      ? `${vehicle.make} ${vehicle.model}`
      : `${vehicleLogs[0].vehicleMake ?? ''} ${vehicleLogs[0].vehicleModel ?? ''}`.trim() ||
        vehicleLogs[0].vehiclePlate ||
        vehicleId;
    return {
      vehicleId,
      label,
      fuelType: vehicle?.fuelType ?? 'petrol',
      color: vehicleTrendColor(vehicle?.color),
      data: calculate(vehicleLogs)
    };
  });
};

class ChartStore {
  mileageData? = $derived<DataPoint[]>(calculateMileageData(fuelLogStore.fuelLogs || []));
  costData? = $derived<DataPoint[]>(calculateCostData(fuelLogStore.fuelLogs || []));
  fuelAmountData? = $derived<DataPoint[]>(calculateFuelAmountData(fuelLogStore.fuelLogs || []));

  mileageByVehicle = $derived<VehicleTrendSeries[]>(
    groupByVehicle(fuelLogStore.fuelLogs || [], calculateMileageData)
  );
  fuelAmountByVehicle = $derived<VehicleTrendSeries[]>(
    groupByVehicle(fuelLogStore.fuelLogs || [], calculateFuelAmountData)
  );
}

export const chartStore = new ChartStore();
