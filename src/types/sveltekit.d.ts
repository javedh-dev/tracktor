// Extend SvelteKit types for route parameters
declare module '@sveltejs/kit' {
	interface RouteParams {
		[key: string]: string | undefined;
		vehicleId?: string;
		licensePlate?: string;
		logId?: string;
		insuranceId?: string;
		puccId?: string;
	}
}

export {};
