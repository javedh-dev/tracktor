export type FuelLogInput = {
  filled: boolean;
  missedLast: boolean;
  odometer: number | null;
  fuelAmount: number | null;
};

export function computeLatestOdometer(
  baseOdometer: number | null,
  maxFuelOdometer: number | null,
  maxMaintenanceOdometer: number | null
): number {
  const values = [baseOdometer, maxFuelOdometer, maxMaintenanceOdometer].filter(
    (v): v is number => v !== null && v > 0
  );
  return values.length > 0 ? Math.max(...values) : 0;
}

export type MileageResult = {
  distance: number;
  totalFuel: number;
};

function findMileageWindows(fuelLogs: FuelLogInput[]): MileageResult[] {
  const results: MileageResult[] = [];

  for (let index = 0; index < fuelLogs.length; index++) {
    const log = fuelLogs[index]!;
    if (
      index === 0 ||
      !log.filled ||
      log.missedLast ||
      log.odometer === null ||
      log.fuelAmount === null
    ) {
      continue;
    }

    let startIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (fuelLogs[i]?.filled && fuelLogs[i]?.odometer !== null) {
        startIndex = i;
        break;
      }
      if (fuelLogs[i]?.missedLast) {
        break;
      }
    }

    if (startIndex === -1) continue;

    const startLog = fuelLogs[startIndex]!;
    const distance = log.odometer - startLog.odometer!;
    if (distance <= 0) continue;

    let totalFuel = 0;
    for (let i = startIndex + 1; i <= index; i++) {
      const amount = fuelLogs[i]!.fuelAmount;
      if (amount !== null) totalFuel += amount;
    }
    if (totalFuel === 0) continue;

    results.push({ distance, totalFuel });
  }

  return results;
}

export function computeAverageMileage(fuelLogs: FuelLogInput[]): number | null {
  const windows = findMileageWindows(fuelLogs);
  if (windows.length === 0) return null;

  const ratios = windows.map((w) => w.distance / w.totalFuel);
  const avg = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
  return parseFloat(avg.toFixed(2));
}

export function computeMileagePerWindow(fuelLogs: FuelLogInput[]): (number | null)[] {
  const windows = findMileageWindows(fuelLogs);

  if (windows.length === 0) {
    return fuelLogs.map(() => null);
  }

  let windowIdx = 0;
  return fuelLogs.map((log, index) => {
    if (
      index === 0 ||
      !log.filled ||
      log.missedLast ||
      log.odometer === null ||
      log.fuelAmount === null
    ) {
      return null;
    }
    const w = windows[windowIdx]!;
    windowIdx++;
    return parseFloat((w.distance / w.totalFuel).toFixed(2));
  });
}
