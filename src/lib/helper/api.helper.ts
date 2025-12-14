import { HttpClient } from './http.helper';

export const apiClient = new HttpClient({
	baseURL: `/api`,
	headers: {
		'Content-Type': 'application/json'
	},
	timeout: 5000
});
