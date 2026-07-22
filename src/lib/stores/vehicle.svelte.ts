import type { Vehicle } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';

class VehicleStore {
  vehicles = $state<Vehicle[]>();
  selectedId = $state<string>();
  processing = $state(false);
  error = $state<string>();

  setVehicles = (vehicles: Vehicle[]) => {
    this.vehicles = vehicles;
    if (vehicles && vehicles.length > 0) {
      this.selectedId = vehicles[0].id || undefined;
    } else {
      this.selectedId = undefined;
    }
  };

  refreshVehicles = () => {
    this.processing = true;
    apiClient
      .get<ApiResponse>('/vehicles')
      .then(({ data: res }) => {
        this.vehicles = res.data;
        if (this.vehicles && this.vehicles.length > 0) {
          this.selectedId = this.vehicles[0].id || undefined;
        } else {
          this.selectedId = undefined;
        }
        this.error = undefined;
      })
      .catch((err) => (this.error = 'Failed to fetch vehicles'))
      .finally(() => (this.processing = false));
  };
}

export const vehicleStore = new VehicleStore();
