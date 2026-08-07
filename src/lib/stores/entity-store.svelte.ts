import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';

interface EntityStoreOptions<T> {
  buildPath: (vehicleId?: string) => string;
  sort?: (a: T, b: T) => number;
  map?: (raw: unknown) => T;
  errorMessage?: string;
}

export function createEntityStore<T>(options: EntityStoreOptions<T>) {
  let items = $state<T[]>() as T[] | undefined;
  let processing = $state(false);
  let error = $state<string>();
  // Remembered so post-mutation reloads stay in the scope the user is viewing
  // instead of silently widening the list back to the whole fleet.
  let currentVehicleId: string | undefined;
  // A page and the list it renders often derive the same scope independently,
  // so both ask for it on mount. Share the in-flight request instead of
  // firing duplicate round trips.
  let inFlight: { path: string; promise: Promise<void> } | undefined;

  function refresh(vehicleId?: string): Promise<void> {
    currentVehicleId = vehicleId;
    const urlPath = options.buildPath(vehicleId);
    if (inFlight?.path === urlPath) return inFlight.promise;

    const promise = (async () => {
      processing = true;
      try {
        const { data: res } = await apiClient.get<ApiResponse>(urlPath);
        let result: T[] = options.map
          ? (res.data as unknown[]).map(options.map)
          : (res.data as T[]);
        if (options.sort) result = [...result].sort(options.sort);
        items = result;
        error = undefined;
      } catch {
        error = options.errorMessage || 'Failed to fetch data';
      } finally {
        processing = false;
        if (inFlight?.path === urlPath) inFlight = undefined;
      }
    })();

    inFlight = { path: urlPath, promise };
    return promise;
  }

  /**
   * Re-fetch the current scope. Use after a create/edit/delete — it bypasses
   * the in-flight dedupe so it never resolves with pre-mutation data.
   */
  function reload(): Promise<void> {
    inFlight = undefined;
    return refresh(currentVehicleId);
  }

  function clear(): void {
    items = undefined;
  }

  return {
    get items() {
      return items;
    },
    get processing() {
      return processing;
    },
    get error() {
      return error;
    },
    refresh,
    reload,
    clear
  };
}
