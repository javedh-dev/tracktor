import type { Config, Configs } from '$lib/domain/config';
import { BOOLEAN_CONFIG_KEYS } from '$lib/domain/config';

/**
 * Build a form-friendly record from the raw Config[] array.
 * Boolean config keys become actual booleans; everything else stays a string.
 * Missing keys are filled from the provided fallback defaults.
 */
export function rawConfigToFormData(
  rawConfig: Config[],
  fallback: Configs
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const item of rawConfig) {
    if (BOOLEAN_CONFIG_KEYS.has(item.key)) {
      data[item.key] = item.value === 'true';
    } else {
      data[item.key] = item.value || '';
    }
  }
  // Fill in fallbacks for keys that may not be in the DB yet
  const fb = fallback as unknown as Record<string, unknown>;
  for (const key of Object.keys(fb)) {
    if (data[key] === undefined) {
      data[key] = fb[key];
    }
  }
  return data;
}

/**
 * Convert form data back into a Config[] array suitable for the save API.
 * Merges with existing rawConfig to preserve descriptions and any extra keys.
 * The `theme` key is excluded since it is stored client-side only.
 */
export function formDataToConfigs(
  formData: Record<string, unknown>,
  existingRaw: Config[]
): Config[] {
  const configMap = new Map<string, Config>();
  for (const item of existingRaw) {
    configMap.set(item.key, item);
  }
  for (const [key, value] of Object.entries(formData)) {
    if (key === 'theme') continue;
    const stringValue = typeof value === 'boolean' ? String(value) : ((value || '') as string);
    const existing = configMap.get(key);
    if (existing) {
      configMap.set(key, { ...existing, value: stringValue });
    } else {
      configMap.set(key, { key, value: stringValue });
    }
  }
  return Array.from(configMap.values());
}
