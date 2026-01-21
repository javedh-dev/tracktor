import type { ApiResponse } from '$lib/response';
import { withBase } from '$lib/utils';

/**
 * Fetch autocomplete suggestions for a given field
 */
async function fetchAutocompleteSuggestions(
	field: string,
	params?: Record<string, string>
): Promise<string[]> {
	try {
		const searchParams = new URLSearchParams({ field, ...params });
		const response = await fetch(withBase(`/api/autocomplete?${searchParams.toString()}`));

		if (!response.ok) {
			console.error(`Failed to fetch autocomplete suggestions for ${field}`);
			return [];
		}

		const result: ApiResponse = await response.json();
		return result.data || [];
	} catch (error) {
		console.error(`Error fetching autocomplete suggestions for ${field}:`, error);
		return [];
	}
}

/**
 * Get unique service center names from maintenance logs
 */
export async function getServiceCenterSuggestions(): Promise<string[]> {
	return fetchAutocompleteSuggestions('serviceCenter');
}

/**
 * Get unique insurance provider names
 */
export async function getInsuranceProviderSuggestions(): Promise<string[]> {
	return fetchAutocompleteSuggestions('insuranceProvider');
}

/**
 * Get unique testing center names from pollution certificates
 */
export async function getTestingCenterSuggestions(): Promise<string[]> {
	return fetchAutocompleteSuggestions('testingCenter');
}

/**
 * Get unique vehicle makes
 */
export async function getVehicleMakeSuggestions(): Promise<string[]> {
	return fetchAutocompleteSuggestions('vehicleMake');
}

/**
 * Get unique vehicle models, optionally filtered by make
 */
export async function getVehicleModelSuggestions(make?: string): Promise<string[]> {
	const params = make ? { make } : { make: '' };
	return fetchAutocompleteSuggestions('vehicleModel', params);
}
