import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { Vehicle } from '$lib/domain/vehicle';

/** Query param used to express the current vehicle scope in the URL. */
const SCOPE_PARAM = 'vehicle';

export interface VehicleScope {
  vehicleId?: string;
  vehicle?: Vehicle;
  isFleet: boolean;
}

/**
 * Read the current vehicle scope from the URL.
 *
 * Falls back to fleet (`isFleet: true`, no vehicleId) when the param is
 * absent, or when the id doesn't match any known vehicle (stale/deleted
 * vehicle, or a hand-typed URL). While `vehicles` is still loading
 * (`undefined`), the param is trusted as-is with `vehicle` left undefined.
 *
 * Plain function — call sites wrap it in `$derived(...)` using `page` from
 * `$app/state`.
 */
export function readVehicleScope(url: URL, vehicles: Vehicle[] | undefined): VehicleScope {
  const vehicleId = url.searchParams.get(SCOPE_PARAM);

  if (!vehicleId) {
    return { isFleet: true };
  }

  if (vehicles === undefined) {
    return { vehicleId, isFleet: false };
  }

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    return { isFleet: true };
  }

  return { vehicleId, vehicle, isFleet: false };
}

/** Navigate to the current path with the scope param set (or removed when omitted). */
export function setVehicleScope(vehicleId?: string): void {
  const url = new URL(page.url);
  if (vehicleId) {
    url.searchParams.set(SCOPE_PARAM, vehicleId);
  } else {
    url.searchParams.delete(SCOPE_PARAM);
  }
  goto(`${url.pathname}${url.search}`, { keepFocus: true, noScroll: true });
}
