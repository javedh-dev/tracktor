import { HttpClient } from '$lib/helper/http.helper';
import type { Response } from '$lib/domain';
import type { ApiResponse } from '$lib/response';
import { withBase } from '$lib/utils';

// Create a separate HTTP client for file uploads with longer timeout
const fileUploadClient = new HttpClient({
	baseURL: withBase('/api'),
	headers: {
		// Don't set Content-Type for FormData - let the browser set it with boundary
	},
	timeout: 30000 // 30 seconds for file uploads
});

export const uploadFile = async (file: File): Promise<Response<any>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const formData = new FormData();
		formData.append('file', file);
		const response = await fileUploadClient.post<ApiResponse>('/files', formData);
		res.data = response.data.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to upload file.';
	}
	return res;
};
