import { apiClient } from '$lib/helper/api.helper';
import type { Response } from '$lib/domain';
import type { ApiResponse } from '$lib/response';

export const uploadFile = async (file: File): Promise<Response<any>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const formData = new FormData();
		formData.append('file', file);
		const response = await apiClient.post<ApiResponse>('/files', formData);
		res.data = response.data.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to upload file.';
	}
	return res;
};
