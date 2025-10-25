import { browser } from '$app/environment';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';

class AuthStore {
	pin = $state<string>();

	constructor() {
		if (browser) {
			const pin = localStorage.getItem('userPin');
			if (pin) {
				this.login(pin);
			}
		}
	}

	isPinConfigured = async () => {
		return apiClient
			.get<ApiResponse>('/auth/status')
			.then(({ data: res }) => res.data.exists as boolean)
			.catch(() => false);
	};

	login = async (pin: string) => {
		return apiClient
			.post<ApiResponse>('/auth/verify', { pin })
			.then(({ data: res }) => {
				if (res.success) {
					this.pin = pin;
					if (browser) {
						localStorage.setItem('userPin', pin);
					}
				}
			})
			.catch((err) => (this.pin = undefined));
	};

	logout = () => {
		this.pin = undefined;
	};
}

export const authStore = new AuthStore();
