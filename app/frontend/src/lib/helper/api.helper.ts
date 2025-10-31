import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { HttpClient } from './http.helper';

const baseURL = env.TRACKTOR_API_BASE_URL || '';
export const apiClient = new HttpClient({
	baseURL: `${baseURL}/api`,
	headers: {
		'x-user-pin': browser ? localStorage.getItem('userPin') || '' : ''
	},
	timeout: 5000
});

if (!env.TRACKTOR_DISABLE_AUTH) {
	apiClient.addRequestInterceptor((req) => {
		const userPin = browser ? localStorage.getItem('userPin') || '' : '';
		if (userPin === '') return false;
		req.headers = {
			...req.headers,
			...{
				'x-user-pin': userPin
			}
		};
		return true;
	});
}
