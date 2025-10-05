import { browser } from '$app/environment';
import type { ApiResponse } from '@tracktor/common';
import { axios } from '$lib/helper/axios';
import { writable } from 'svelte/store';

const createAuthStore = () => {
	const { set, subscribe } = writable<string | null>();

	const isPinConfigured = async () => {
		return axios
			.get<ApiResponse>('/auth/status')
			.then(({ data: res }) => res.data.exists as boolean)
			.catch(() => false);
	};

	const login = async (pin: string) => {
		return axios
			.post<ApiResponse>('/auth/verify', { pin })
			.then(({ data: res }) => {
				if (res.success) {
					set(pin);
					if (browser) {
						localStorage.setItem('userPin', pin);
					}
				}
			})
			.catch((err) => set(null));
	};

	const logout = () => {
		set(null);
	};

	if (browser) {
		const pin = localStorage.getItem('userPin');
		if (pin) {
			login(pin);
		}
	}

	return { subscribe, login, logout, isPinConfigured };
};

export const authStore = createAuthStore();
