import type { Vehicle } from '$lib/domain/vehicle';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';

class VehicleStore {
  vehicles = $state<Vehicle[]>();
  processing = $state(false);
  error = $state<string>();

  setVehicles = (vehicles: Vehicle[]) => {
    this.vehicles = vehicles;
  };

  refreshVehicles = () => {
    this.processing = true;
    apiClient
      .get<ApiResponse>('/vehicles')
      .then(({ data: res }) => {
        this.vehicles = res.data;
        this.error = undefined;
      })
      .catch(() => (this.error = 'Failed to fetch vehicles'))
      .finally(() => (this.processing = false));
  };
}

export const vehicleStore = new VehicleStore();
