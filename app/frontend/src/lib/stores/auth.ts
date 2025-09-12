import { browser } from '$app/environment';

export class AuthState {
	private static instance: AuthState;
	private isAuthenticated: boolean = false;

	private constructor(currentRoute: string) {
		this.isAuthenticated = false;
		if (browser) {
			if (currentRoute !== '/login') {
				const pin = localStorage.getItem('userPin');
				this.isAuthenticated = !!pin;
			} else if (currentRoute === '/login') {
				this.isAuthenticated = true; // Always allow login page
			}
		}
	}

	public static getInstance(currentRoute: string): AuthState {
		if (!AuthState.instance) {
			AuthState.instance = new AuthState(currentRoute);
		}
		return AuthState.instance;
	}

	public getIsAuthenticated(): boolean {
		return this.isAuthenticated;
	}

	public setIsAuthenticated(value: boolean): void {
		this.isAuthenticated = value;
	}
}
