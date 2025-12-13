import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { HttpClient } from './http.helper';

const baseURL = env.TRACKTOR_API_BASE_URL || '';
export const apiClient = new HttpClient({
	baseURL: `${baseURL}/api`,
	headers: {
		'Content-Type': 'application/json'
	},
	timeout: 5000
});

// Session-based authentication is handled via cookies automatically
// No need for manual headers since cookies are sent automatically
if (env.TRACKTOR_DISABLE_AUTH !== 'true') {
	apiClient.addRequestInterceptor((req) => {
		// Session authentication is handled via cookies
		// The browser will automatically include the session cookie
		return true;
	});
}
