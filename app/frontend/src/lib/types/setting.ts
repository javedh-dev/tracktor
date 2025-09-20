import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getApiUrl } from '$helper/api';

export interface Config {
	key: string;
	value?: string;
	description?: string;
}
