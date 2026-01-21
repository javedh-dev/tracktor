import { HttpClient } from './http.helper';
import { withBase } from '$lib/utils';

export const apiClient = new HttpClient({
	baseURL: withBase('/api'),
	headers: {
		'Content-Type': 'application/json'
	},
	timeout: 15000 // 15 seconds for regular API calls
});
