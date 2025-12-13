import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';
import { apiClient } from '../helper/api.helper';
import type { ApiResponse } from '../response';
import { toast } from 'svelte-sonner';

interface User {
	id: string;
	username: string;
}

class AuthStore {
	user = $state<User | null>(null);
	isLoggedIn = $state<boolean>(false);
	hasUsers = $state<boolean>(false);

	constructor() {
		this.isLoggedIn = env.TRACKTOR_DISABLE_AUTH === 'true';
		// Don't automatically check auth status in constructor
		// Let pages call checkAuthStatus explicitly when needed
	}

	checkAuthStatus = async () => {
		try {
			const { data: res } = await apiClient.get<ApiResponse>('/auth', { skipInterceptors: true });
			this.hasUsers = res.data.hasUsers;

			// Check if user is authenticated based on server response
			if (res.data.isAuthenticated && res.data.user) {
				this.user = res.data.user;
				this.isLoggedIn = true;
			} else {
				this.user = null;
				this.isLoggedIn = false;
			}
		} catch (error) {
			console.error('Error checking auth status:', error);
			this.hasUsers = false;
			this.user = null;
			this.isLoggedIn = false;
		}
	};

	login = async (username: string, password: string) => {
		try {
			const { data: res } = await apiClient.post<ApiResponse>(
				'/auth',
				{ username, password },
				{ skipInterceptors: true }
			);

			if (res.success && res.data) {
				this.user = res.data.user;
				this.isLoggedIn = true;
				toast.success('Login successful');
				return true;
			}
			return false;
		} catch (err: any) {
			this.user = null;
			this.isLoggedIn = false;
			console.error('Login error:', err);
			toast.error(`Login failed: ${err.response?.data?.message || err.message}`);
			return false;
		}
	};

	register = async (username: string, password: string) => {
		try {
			const { data: res } = await apiClient.post<ApiResponse>(
				'/auth/register',
				{ username, password },
				{ skipInterceptors: true }
			);

			if (res.success) {
				toast.success('User created successfully. Please login.');
				this.hasUsers = true;
				return true;
			}
			return false;
		} catch (err: any) {
			console.error('Registration error:', err);
			toast.error(`Registration failed: ${err.response?.data?.message || err.message}`);
			return false;
		}
	};

	logout = async () => {
		try {
			await apiClient.delete('/auth');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			this.user = null;
			this.isLoggedIn = false;
			goto('/login');
		}
	};

	// Legacy method for backward compatibility
	isPinConfigured = async () => {
		const { data: res } = await apiClient.get<ApiResponse>('/auth', { skipInterceptors: true });
		return res.data.hasUsers;
	};
}

export const authStore = new AuthStore();
