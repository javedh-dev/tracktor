import { configStore } from '$stores/config.svelte';

/**
 * Check if a specific feature is enabled in the configuration
 * @param feature - The feature name to check (e.g., 'fuelLog', 'maintenance')
 * @returns boolean - true if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(feature: string): boolean {
  const featureKey =
    `feature${feature.charAt(0).toUpperCase()}${feature.slice(1)}` as keyof typeof configStore.configs;
  return configStore.configs[featureKey] === true;
}

/**
 * Feature flags for easy reference
 */
export const Features = {
  FUEL_LOG: 'fuelLog',
  MAINTENANCE: 'maintenance',
  PUCC: 'pucc',
  REMINDERS: 'reminders',
  INSURANCE: 'insurance',
  OVERVIEW: 'overview'
} as const;

/**
 * @param features - Array of feature names to check
 * @returns boolean - true if all features are enabled
 */
export function areAllFeaturesEnabled(features: string[]): boolean {
  return features.every((feature) => isFeatureEnabled(feature));
}

/**
 * Check if any of the specified features are enabled
 * @param features - Array of feature names to check
 * @returns boolean - true if at least one feature is enabled
 */
export function isAnyFeatureEnabled(features: string[]): boolean {
  return features.some((feature) => isFeatureEnabled(feature));
}
