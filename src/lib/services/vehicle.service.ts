import type { Response, Vehicle } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import { uploadFile } from './file.service';

export const saveVehicleWithImage = async (
  vehicle: Vehicle,
  image: File | undefined,
  method: 'PUT' | 'POST',
  removeExisting: boolean = false
): Promise<Response<Vehicle>> => {
  if (image) {
    try {
      const res = await uploadFile(image);
      vehicle.image = res.data.filename || null;
    } catch (e: any) {
      return {
        status: 'ERROR',
        error: e.response?.data?.message || 'Failed to upload image'
      };
    }
  }

  // Handle explicit removal of existing image while editing
  if (removeExisting) {
    vehicle.image = null;
  }
  // Preserve current image when editing without uploading/replacing
  else if (!image && vehicle.id) {
    const { image: _, ...vehicleWithoutImage } = vehicle;
    return saveVehicle(vehicleWithoutImage as Vehicle, method);
  }
  return saveVehicle(vehicle, method);
};

const saveVehicle = async (
  vehicle: Vehicle,
  method: 'PUT' | 'POST'
): Promise<Response<Vehicle>> => {
  const res: Response<Vehicle> = { status: 'OK' };
  try {
    const response = await apiClient[method.toLowerCase() as 'put' | 'post']('/vehicles/', vehicle);
    res.data = response.data;
  } catch (e: any) {
    res.status = 'ERROR';
    res.error = e.response?.data?.message || 'Failed to save vehicle.';
  }
  return res;
};

export const deleteVehicle = async (vehicleId: string): Promise<Response<string>> => {
  const res: Response<string> = { status: 'OK' };
  try {
    await apiClient.delete(`/vehicles/${vehicleId}`);
    res.data = vehicleId;
  } catch (e: any) {
    res.status = 'ERROR';
    res.error = e.response?.data?.message || 'Failed to delete vehicle.';
  }
  return res;
};
