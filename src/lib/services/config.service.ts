import type { Config } from '$lib/domain/config';
import type { Response } from '$lib/domain/shared';
import { apiClient } from '$lib/helper/api.helper';

export const saveConfig = async (configs: Config[]): Promise<Response<any>> => {
  const res: Response<any> = { status: 'OK' };
  try {
    const url = `/config`;

    const response = await apiClient.put(url, configs);
    res.data = response.data;
  } catch (e: any) {
    res.status = 'ERROR';
    res.error = e.response?.data?.message || 'Failed to save config.';
  }
  return res;
};
