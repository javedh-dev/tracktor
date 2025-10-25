import type { Config, Response } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';

export const saveConfig = async (configs: Config[]): Promise<Response<any>> => {
	const res: Response<any> = { status: 'OK' };
	try {
		const url = `/configs`;

		const response = await apiClient['post'](url, configs);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to save Configs.';
	}
	return res;
};
