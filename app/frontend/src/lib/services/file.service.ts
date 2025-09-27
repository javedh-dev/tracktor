import { getApiUrl } from '$lib/helper/api';
import type { Response } from '$lib/types';

export const uploadFile = async (file: File): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(getApiUrl('/api/upload'), {
			method: 'POST',
			headers: {
				'X-User-PIN': localStorage.getItem('userPin') || ''
			},
			body: formData
		});

		if (response.ok) {
			const jsonData = await response.json();
			res.data = jsonData.filename;
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to upload file.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while uploading file : ' + e;
	}
	return res;
};
