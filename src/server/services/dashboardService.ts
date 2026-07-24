import { db } from '../db/index';

const EXPIRING_SOON_DAYS = 30;

export interface DashboardSummary {
  totalVehicles: number;
  totalFuelUsed: number;
  totalDistance: number;
  totalExpenses: number;
  expenseBreakdown: {
    fuel: number;
    maintenance: number;
    insurance: number;
  };
  puccStatus: {
    valid: number;
    expiringSoon: number;
    expired: number;
    notAvailable: number;
  };
  vehicleHealth: {
    good: number;
    attention: number;
    needsAction: number;
  };
  upcomingReminders: Array<{
    id: string;
    vehicleId: string;
    vehicleName: string;
    vehiclePlate: string | null;
    type: string;
    note: string | null;
    dueDate: string;
    daysUntilDue: number;
  }>;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);

  const [
    vehicles,
    fuelLogs,
    maintenanceLogs,
    insurances,
    pollutionCerts,
    reminders,
    allInsurancesForExpense
  ] = await Promise.all([
    db.query.vehicleTable.findMany({
      columns: {
        id: true,
        make: true,
        model: true,
        licensePlate: true,
        image: true,
        odometer: true
      }
    }),
    db.query.fuelLogTable.findMany({
      columns: {
        fuelAmount: true,
        cost: true,
        filled: true,
        odometer: true,
        date: true,
        vehicleId: true
      }
    }),
    db.query.maintenanceLogTable.findMany({
      columns: { cost: true, odometer: true, vehicleId: true }
    }),
    db.query.insuranceTable.findMany({
      columns: { vehicleId: true, endDate: true, cost: true }
    }),
    db.query.pollutionCertificateTable.findMany({
      columns: { vehicleId: true, expiryDate: true }
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
    }),
    db.query.insuranceTable.findMany({
      columns: { cost: true }
    })
  ]);

  // Totals
  const totalVehicles = vehicles.length;
  const totalFuelUsed = fuelLogs.reduce((sum, l) => sum + (l.fuelAmount || 0), 0);
  const totalFuelCost = fuelLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const totalInsuranceCost = allInsurancesForExpense.reduce((sum, i) => sum + (i.cost || 0), 0);
  const totalDistance = fuelLogs
    .filter((l) => l.odometer && l.filled)
    .reduce((sum, l, i, arr) => {
      if (i === 0) return sum;
      const prev = arr[i - 1];
      if (prev.odometer && l.odometer && l.odometer > prev.odometer) {
        return sum + (l.odometer - prev.odometer);
      }
      return sum;
    }, 0);
  const totalExpenses = totalFuelCost + totalMaintenanceCost + totalInsuranceCost;

  // PUC Status
  const puccByVehicle = new Map<string, Date>();
  for (const cert of pollutionCerts) {
    if (cert.expiryDate) {
      const existing = puccByVehicle.get(cert.vehicleId);
      const certDate = new Date(cert.expiryDate);
      if (!existing || certDate > existing) {
        puccByVehicle.set(cert.vehicleId, certDate);
      }
    }
  }

  let puccValid = 0;
  let puccExpiringSoon = 0;
  let puccExpired = 0;
  let puccNotAvailable = 0;

  for (const vehicle of vehicles) {
    const expiryDate = puccByVehicle.get(vehicle.id);
    if (!expiryDate) {
      puccNotAvailable++;
    } else if (expiryDate < today) {
      puccExpired++;
    } else if (expiryDate <= thirtyDaysFromNow) {
      puccExpiringSoon++;
    } else {
      puccValid++;
    }
  }

  // Vehicle Health
  const insuranceByVehicle = new Map<string, Date>();
  for (const ins of insurances) {
    if (ins.endDate) {
      const existing = insuranceByVehicle.get(ins.vehicleId);
      const insDate = new Date(ins.endDate);
      if (!existing || insDate > existing) {
        insuranceByVehicle.set(ins.vehicleId, insDate);
      }
    }
  }

  const remindersByVehicle = new Map<string, typeof reminders>();
  for (const r of reminders) {
    if (!remindersByVehicle.has(r.vehicleId)) {
      remindersByVehicle.set(r.vehicleId, []);
    }
    remindersByVehicle.get(r.vehicleId)!.push(r);
  }

  let healthGood = 0;
  let healthAttention = 0;
  let healthNeedsAction = 0;

  for (const vehicle of vehicles) {
    const insDate = insuranceByVehicle.get(vehicle.id);
    const puccDate = puccByVehicle.get(vehicle.id);
    const vehicleReminders = remindersByVehicle.get(vehicle.id) || [];

    const hasExpiredPucc = puccDate && new Date(puccDate) < today;
    const hasExpiredInsurance = insDate && new Date(insDate) < today;
    const hasExpiringPucc =
      puccDate && new Date(puccDate) <= thirtyDaysFromNow && new Date(puccDate) >= today;
    const hasExpiringInsurance =
      insDate && new Date(insDate) <= thirtyDaysFromNow && new Date(insDate) >= today;
    const hasOverdueReminder = vehicleReminders.some(
      (r) => !r.isCompleted && r.dueDate && new Date(r.dueDate) < today
    );
    const hasUpcomingReminder = vehicleReminders.some(
      (r) =>
        !r.isCompleted &&
        r.dueDate &&
        new Date(r.dueDate) <= thirtyDaysFromNow &&
        new Date(r.dueDate) >= today
    );

    if (hasExpiredPucc || hasExpiredInsurance || hasOverdueReminder) {
      healthNeedsAction++;
    } else if (hasExpiringPucc || hasExpiringInsurance || hasUpcomingReminder) {
      healthAttention++;
    } else {
      healthGood++;
    }
  }

  // Upcoming Reminders
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  const upcomingReminders = reminders
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
    .slice(0, 10);

  return {
    totalVehicles,
    totalFuelUsed,
    totalDistance,
    totalExpenses,
    expenseBreakdown: {
      fuel: totalFuelCost,
      maintenance: totalMaintenanceCost,
      insurance: totalInsuranceCost
    },
    puccStatus: {
      valid: puccValid,
      expiringSoon: puccExpiringSoon,
      expired: puccExpired,
      notAvailable: puccNotAvailable
    },
    vehicleHealth: {
      good: healthGood,
      attention: healthAttention,
      needsAction: healthNeedsAction
    },
    upcomingReminders
  };
}
