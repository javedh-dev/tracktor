import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';

class AuthStore {
	pin = $state<string>();
	isLoggedIn = $state<boolean>(false);

	constructor() {
		this.isLoggedIn = env.TRACKTOR_DISABLE_AUTH === 'true';
		if (browser && !this.isLoggedIn) {
			const pin = localStorage.getItem('userPin');
			if (pin) {
				this.login(pin);
			}
		}
	}

	isPinConfigured = async () => {
		return apiClient
			.get<ApiResponse>('/auth/status', { skipInterceptors: true })
			.then(({ data: res }) => res.data.exists as boolean)
			.catch(() => false);
	};

	login = async (pin: string) => {
		return apiClient
			.post<ApiResponse>('/auth/verify', { pin }, { skipInterceptors: true })
			.then(({ data: res }) => {
				if (res.success) {
					this.pin = pin;
					if (browser) {
						localStorage.setItem('userPin', pin);
					}
					this.isLoggedIn = true;
				}
			})
			.catch((err) => (this.pin = undefined));
	};

	logout = () => {
		localStorage.removeItem('userPin');
		this.pin = undefined;
		this.isLoggedIn = false;
		goto('/');
	};
}

export const authStore = new AuthStore();
