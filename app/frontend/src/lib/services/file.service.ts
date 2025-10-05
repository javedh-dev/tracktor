import { axiosAuth } from '$lib/helper/api';
import type { Response } from '$lib/types';
import type { ApiResponse } from '@tracktor/common';

export const uploadFile = async (file: File): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const formData = new FormData();
		formData.append('file', file);

		const response = await axiosAuth.post<ApiResponse>('/api/files', formData, {
			headers: {
				'X-User-PIN': localStorage.getItem('userPin') || ''
			}
		});

		if (response.status === 200) {
			res.data = response.data.data.filename;
		} else {
			res.status = 'ERROR';
			res.error = response.data.errors![0] || 'Failed to upload file.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while uploading file : ' + e;
	}
	return res;
};
