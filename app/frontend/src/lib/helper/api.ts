import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { HttpClient } from './http';

/**
 * Constructs API URLs properly, handling base URL concatenation
 */
export function getApiUrl(path: string): string {
	const baseUrl = env.PUBLIC_API_BASE_URL || '';

	// Remove trailing slash from base URL and leading slash from path to avoid double slashes
	const cleanBaseUrl = baseUrl.replace(/\/$/, '');
	const cleanPath = path.replace(/^\//, '');

	// If base URL is empty or just a slash, return the path as-is (relative URL)
	if (!cleanBaseUrl || cleanBaseUrl === '') {
		return `/${cleanPath}`;
	}

	return `${cleanBaseUrl}/${cleanPath}`;
}

// Example of creating a custom client with base configuration
export const apiClient = new HttpClient({
	baseURL: '/api',
	headers: {
		'x-user-pin': browser ? localStorage.getItem('userPin') || '' : ''
	},
	timeout: 5000
});
