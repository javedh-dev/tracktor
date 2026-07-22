import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';

interface EntityStoreOptions<T> {
  buildPath: () => string | undefined;
  sort?: (a: T, b: T) => number;
  map?: (raw: unknown) => T;
  errorMessage?: string;
}

export function createEntityStore<T>(options: EntityStoreOptions<T>) {
  let items = $state<T[]>() as T[] | undefined;
  let processing = $state(false);
  let error = $state<string>();

  async function refresh(): Promise<void> {
    const urlPath = options.buildPath();
    if (!urlPath) return;
    processing = true;
    try {
      const { data: res } = await apiClient.get<ApiResponse>(urlPath);
      let result: T[] = options.map ? (res.data as unknown[]).map(options.map) : (res.data as T[]);
      if (options.sort) result = [...result].sort(options.sort);
      items = result;
      error = undefined;
    } catch {
      error = options.errorMessage || 'Failed to fetch data';
    } finally {
      processing = false;
    }
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
    clear
  };
}
