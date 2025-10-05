import { env } from '$env/dynamic/public';
import type { ApiResponse } from '@tracktor/common';
import axios, { type AxiosResponse } from 'axios';
import { toast } from 'svelte-sonner';
import { authStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';
import { createAxiosInstnace } from './axios';

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

const axiosAuth = createAxiosInstnace();

axiosAuth.interceptors.request.use((config) => {
	const pin = get(authStore);
	if (pin) {
		config.headers.set({ 'X-User-PIN': pin }, true);
	}
	return config;
});

export { axiosAuth };
