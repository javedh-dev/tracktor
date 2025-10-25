import { apiClient } from '$lib/helper/api.helper';
import type { Response } from '$lib/helper/http.helper';

export const uploadFile = async (file: File): Promise<Response<string>> => {
	const formData = new FormData();
	formData.append('file', file);
	return apiClient.post<string>('/files', formData);
};
