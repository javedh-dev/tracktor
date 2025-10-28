import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { HttpClient } from './http.helper';

const baseURL = env.PUBLIC_API_BASE_URL || '';
export const apiClient = new HttpClient({
	baseURL: `${baseURL}/api`,
	headers: {
		'x-user-pin': browser ? localStorage.getItem('userPin') || '' : ''
	},
	timeout: 5000
});

apiClient.addRequestInterceptor((req) => {
	req.headers = {
		...req.headers,
		...{
			'x-user-pin': browser ? localStorage.getItem('userPin') || '' : ''
		}
	};
});
