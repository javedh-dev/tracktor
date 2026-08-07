import { db } from '../db/index';
import {
  computeAverageMileage,
  computeTotalDistance,
  type FuelLogInput
} from '$lib/domain/fuel/mileage';
import type {
  ActivityEntry,
  DashboardSummary,
  MonthlyExpensePoint,
  StatusBucket,
  UpcomingReminder,
  VehicleSummary
} from '$lib/domain/dashboard';

const EXPIRING_SOON_DAYS = 30;
const FUEL_TREND_MAX_POINTS = 10;
const ACTIVITY_MAX_ENTRIES = 15;
const UPCOMING_REMINDERS_MAX = 10;
const MONTHLY_TREND_MONTHS = 12;

async function fetchRawData() {
  const [vehicles, fuelLogs, maintenanceLogs, complianceDocuments, reminders] = await Promise.all([
    db.query.vehicleTable.findMany({
      columns: {
        id: true,
        make: true,
        model: true,
        licensePlate: true,
        image: true,
        odometer: true,
        fuelType: true
      }
    }),
    db.query.fuelLogTable.findMany({
      columns: {
        vehicleId: true,
        fuelAmount: true,
        cost: true,
        filled: true,
        missedLast: true,
        odometer: true,
        date: true
      },
      orderBy: (log, { asc }) => [asc(log.date), asc(log.odometer)]
    }),
    db.query.maintenanceLogTable.findMany({
      columns: { vehicleId: true, cost: true, odometer: true, date: true, serviceCenter: true }
    }),
    db.query.complianceDocumentTable.findMany({
      columns: { vehicleId: true, type: true, startDate: true, endDate: true, cost: true }
    }),
    db.query.reminderTable.findMany({
      columns: {
        id: true,
        vehicleId: true,
        type: true,
        note: true,
        dueDate: true,
        isCompleted: true
      }
    })
  ]);

  return { vehicles, fuelLogs, maintenanceLogs, complianceDocuments, reminders };
}

type RawData = Awaited<ReturnType<typeof fetchRawData>>;

function statusFromExpiry(
  expiry: Date | undefined,
  today: Date,
  soonCutoff: Date
): VehicleSummary['otherComplianceStatus'] {
  if (!expiry) return 'not_available';
  if (expiry < today) return 'expired';
  if (expiry <= soonCutoff) return 'expiring_soon';
  return 'valid';
}

function buildVehicleSummaries(raw: RawData): VehicleSummary[] {
  const today = new Date();
  const soonCutoff = new Date(today.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);

  const fuelLogsByVehicle = new Map<string, RawData['fuelLogs']>();
  const fuelCostByVehicle = new Map<string, number>();
  for (const log of raw.fuelLogs) {
    if (!fuelLogsByVehicle.has(log.vehicleId)) fuelLogsByVehicle.set(log.vehicleId, []);
    fuelLogsByVehicle.get(log.vehicleId)!.push(log);
    fuelCostByVehicle.set(log.vehicleId, (fuelCostByVehicle.get(log.vehicleId) || 0) + log.cost);
  }

  const maintenanceCostByVehicle = new Map<string, number>();
  for (const log of raw.maintenanceLogs) {
    maintenanceCostByVehicle.set(
      log.vehicleId,
      (maintenanceCostByVehicle.get(log.vehicleId) || 0) + log.cost
    );
  }

  const complianceCostByVehicle = new Map<string, number>();
  const insuranceEndByVehicle = new Map<string, Date>();
  const otherComplianceEndByVehicle = new Map<string, Date>();
  for (const doc of raw.complianceDocuments) {
    if (doc.cost) {
      complianceCostByVehicle.set(
        doc.vehicleId,
        (complianceCostByVehicle.get(doc.vehicleId) || 0) + doc.cost
      );
    }
    if (!doc.endDate) continue;
    const endDate = new Date(doc.endDate);
    const byVehicle =
      doc.type === 'insurance' ? insuranceEndByVehicle : otherComplianceEndByVehicle;
    const existing = byVehicle.get(doc.vehicleId);
    if (!existing || endDate > existing) byVehicle.set(doc.vehicleId, endDate);
  }

  const remindersByVehicle = new Map<string, RawData['reminders']>();
  for (const r of raw.reminders) {
    if (!remindersByVehicle.has(r.vehicleId)) remindersByVehicle.set(r.vehicleId, []);
    remindersByVehicle.get(r.vehicleId)!.push(r);
  }

  return raw.vehicles.map((vehicle) => {
    const vehicleFuelLogs: FuelLogInput[] = fuelLogsByVehicle.get(vehicle.id) || [];
    const totalDistance = computeTotalDistance(vehicleFuelLogs);
    const avgMileage = computeAverageMileage(vehicleFuelLogs);

    const totalFuelCost = fuelCostByVehicle.get(vehicle.id) || 0;
    const totalMaintenanceCost = maintenanceCostByVehicle.get(vehicle.id) || 0;
    const totalComplianceCost = complianceCostByVehicle.get(vehicle.id) || 0;
    const totalExpenses = totalFuelCost + totalMaintenanceCost + totalComplianceCost;

    const otherComplianceStatus = statusFromExpiry(
      otherComplianceEndByVehicle.get(vehicle.id),
      today,
      soonCutoff
    );
    const insuranceStatus = statusFromExpiry(
      insuranceEndByVehicle.get(vehicle.id),
      today,
      soonCutoff
    );

    const vehicleReminders = remindersByVehicle.get(vehicle.id) || [];
    const hasOverdueReminder = vehicleReminders.some(
      (r) => !r.isCompleted && r.dueDate && new Date(r.dueDate) < today
    );
    const hasUpcomingReminder = vehicleReminders.some(
      (r) =>
        !r.isCompleted &&
        r.dueDate &&
        new Date(r.dueDate) <= soonCutoff &&
        new Date(r.dueDate) >= today
    );

    let healthStatus: VehicleSummary['healthStatus'];
    if (
      otherComplianceStatus === 'expired' ||
      insuranceStatus === 'expired' ||
      hasOverdueReminder
    ) {
      healthStatus = 'needs_action';
    } else if (
      otherComplianceStatus === 'expiring_soon' ||
      insuranceStatus === 'expiring_soon' ||
      hasUpcomingReminder
    ) {
      healthStatus = 'attention';
    } else {
      healthStatus = 'good';
    }

    return {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      licensePlate: vehicle.licensePlate,
      image: vehicle.image,
      odometer: vehicle.odometer || 0,
      fuelType: vehicle.fuelType,
      totalDistance,
      totalFuelCost,
      totalMaintenanceCost,
      totalComplianceCost,
      totalExpenses,
      avgMileage,
      costPerDistance:
        totalDistance > 0 ? parseFloat((totalExpenses / totalDistance).toFixed(2)) : null,
      otherComplianceStatus,
      insuranceStatus,
      healthStatus
    };
  });
}

function buildFleetSection(
  vehicles: VehicleSummary[],
  totalFuelUsed: number
): DashboardSummary['fleet'] {
  const totalDistance = vehicles.reduce((sum, v) => sum + v.totalDistance, 0);
  const totalExpenses = vehicles.reduce((sum, v) => sum + v.totalExpenses, 0);
  return {
    totalVehicles: vehicles.length,
    totalDistance,
    totalFuelUsed,
    totalExpenses,
    costPerDistance:
      totalDistance > 0 ? parseFloat((totalExpenses / totalDistance).toFixed(2)) : null
  };
}

function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function buildExpensesSection(raw: RawData): DashboardSummary['expenses'] {
  const fuel = raw.fuelLogs.reduce((sum, l) => sum + l.cost, 0);
  const maintenance = raw.maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);
  const compliance = raw.complianceDocuments.reduce((sum, d) => sum + (d.cost || 0), 0);

  const months: string[] = [];
  const anchor = new Date();
  for (let i = MONTHLY_TREND_MONTHS - 1; i >= 0; i--) {
    months.push(monthKey(new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)));
  }

  const byMonth = new Map<string, MonthlyExpensePoint>(
    months.map((month) => [month, { month, fuel: 0, maintenance: 0, compliance: 0, total: 0 }])
  );

  for (const log of raw.fuelLogs) {
    if (!log.date) continue;
    const point = byMonth.get(monthKey(new Date(log.date)));
    if (point) point.fuel += log.cost;
  }
  for (const log of raw.maintenanceLogs) {
    if (!log.date) continue;
    const point = byMonth.get(monthKey(new Date(log.date)));
    if (point) point.maintenance += log.cost;
  }
  for (const doc of raw.complianceDocuments) {
    if (!doc.startDate || !doc.cost) continue;
    const point = byMonth.get(monthKey(new Date(doc.startDate)));
    if (point) point.compliance += doc.cost;
  }

  const monthlyTrend = months.map((month) => {
    const point = byMonth.get(month)!;
    point.total = point.fuel + point.maintenance + point.compliance;
    return point;
  });

  return {
    breakdown: { fuel, maintenance, compliance },
    monthlyTrend
  };
}

function buildFuelSection(raw: RawData): DashboardSummary['fuel'] {
  const fuelByDate = new Map<string, number>();
  for (const log of raw.fuelLogs) {
    if (!log.date || !log.fuelAmount) continue;
    const dateKey = new Date(log.date).toISOString().slice(0, 10);
    fuelByDate.set(dateKey, (fuelByDate.get(dateKey) || 0) + log.fuelAmount);
  }
  const dailyTrend = Array.from(fuelByDate.entries())
    .map(([date, fuelAmount]) => ({ date, fuelAmount }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-FUEL_TREND_MAX_POINTS);

  return { dailyTrend };
}

function bucketFromStatuses(statuses: VehicleSummary['otherComplianceStatus'][]): StatusBucket {
  const bucket: StatusBucket = { valid: 0, expiringSoon: 0, expired: 0, notAvailable: 0 };
  for (const status of statuses) {
    if (status === 'valid') bucket.valid++;
    else if (status === 'expiring_soon') bucket.expiringSoon++;
    else if (status === 'expired') bucket.expired++;
    else bucket.notAvailable++;
  }
  return bucket;
}

function buildComplianceSection(
  raw: RawData,
  vehicles: VehicleSummary[]
): DashboardSummary['compliance'] {
  const today = new Date();
  const vehicleMap = new Map(raw.vehicles.map((v) => [v.id, v]));

  const vehicleHealth = { good: 0, attention: 0, needsAction: 0 };
  for (const v of vehicles) {
    if (v.healthStatus === 'good') vehicleHealth.good++;
    else if (v.healthStatus === 'attention') vehicleHealth.attention++;
    else vehicleHealth.needsAction++;
  }

  const upcomingReminders: UpcomingReminder[] = raw.reminders
    .filter((r) => !r.isCompleted && r.dueDate)
    .map((r) => {
      const dueDate = new Date(r.dueDate!);
      const vehicle = vehicleMap.get(r.vehicleId);
      return {
        id: r.id,
        vehicleId: r.vehicleId,
        vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown',
        vehiclePlate: vehicle?.licensePlate ?? null,
        type: r.type,
        note: r.note,
        dueDate: dueDate.toISOString(),
        daysUntilDue: Math.ceil((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
      };
    })
    .filter((r) => r.daysUntilDue >= 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, UPCOMING_REMINDERS_MAX);

  return {
    other: bucketFromStatuses(vehicles.map((v) => v.otherComplianceStatus)),
    insurance: bucketFromStatuses(vehicles.map((v) => v.insuranceStatus)),
    vehicleHealth,
    upcomingReminders
  };
}

function buildActivitySection(raw: RawData): ActivityEntry[] {
  const vehicleMap = new Map(raw.vehicles.map((v) => [v.id, v]));
  const vehicleName = (vehicleId: string) => {
    const vehicle = vehicleMap.get(vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown';
  };

  const fuelEntries: ActivityEntry[] = raw.fuelLogs.map((l, i) => ({
    id: `fuel-${l.vehicleId}-${i}`,
    type: 'fuel',
    vehicleId: l.vehicleId,
    vehicleName: vehicleName(l.vehicleId),
    date: l.date,
    description: l.fuelAmount ? `${l.fuelAmount.toFixed(1)}L fill-up` : 'Fuel log',
    cost: l.cost
  }));

  const maintenanceEntries: ActivityEntry[] = raw.maintenanceLogs.map((l, i) => ({
    id: `maintenance-${l.vehicleId}-${i}`,
    type: 'maintenance',
    vehicleId: l.vehicleId,
    vehicleName: vehicleName(l.vehicleId),
    date: l.date,
    description: l.serviceCenter,
    cost: l.cost
  }));

  return [...fuelEntries, ...maintenanceEntries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, ACTIVITY_MAX_ENTRIES);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const raw = await fetchRawData();
  const vehicles = buildVehicleSummaries(raw);
  const totalFuelUsed = raw.fuelLogs.reduce((sum, l) => sum + (l.fuelAmount || 0), 0);

  return {
    fleet: buildFleetSection(vehicles, totalFuelUsed),
    expenses: buildExpensesSection(raw),
    fuel: buildFuelSection(raw),
    compliance: buildComplianceSection(raw, vehicles),
    vehicles,
    activity: buildActivitySection(raw)
  };
}
