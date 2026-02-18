import type { Config, Configs } from '$lib/domain/config';
import { BOOLEAN_CONFIG_KEYS } from '$lib/domain/config';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';
import { setLocale } from '$lib/paraglide/runtime.js';

/** Default config values used as initial state and fallbacks. */
const DEFAULT_CONFIGS: Configs = {
  dateFormat: 'dd/MM/yyyy',
  currency: 'USD',
  unitOfDistance: 'kilometer',
  unitOfVolume: 'liter',
  unitOfLpg: 'liter',
  unitOfCng: 'kilogram',
  mileageUnitFormat: 'distance-per-fuel',
  locale: 'en',
  timezone: 'UTC',
  featureFuelLog: true,
  featureMaintenance: true,
  featurePucc: true,
  featureReminders: true,
  featureInsurance: true,
  featureOverview: true,
  cronJobsEnabled: true,
  cronRemindersEnabled: true,
  cronRemindersSchedule: '0 * * * *',
  cronInsuranceEnabled: true,
  cronInsuranceSchedule: '0 8 * * *',
  cronPuccEnabled: true,
  cronPuccSchedule: '30 8 * * *',
  cronCleanupEnabled: true,
  cronCleanupSchedule: '0 2 * * *',
  cronEmailDigestEnabled: true,
  cronEmailDigestSchedule: '0 9 * * *',
  cronEmailDigestOnStartup: true
};

/**
 * Apply a raw Config[] array from the API onto a typed Configs object.
 * Boolean keys are coerced from 'true'/'false' strings; string keys
 * fall back to defaults when the value is empty.
 */
function applyRawConfigs(target: Configs, items: Config[]): void {
  const t = target as unknown as Record<string, unknown>;
  const defaults = DEFAULT_CONFIGS as unknown as Record<string, unknown>;
  for (const item of items) {
    if (!(item.key in defaults)) continue;
    if (BOOLEAN_CONFIG_KEYS.has(item.key)) {
      t[item.key] = item.value === 'true';
    } else {
      t[item.key] = item.value || defaults[item.key];
    }
  }
}

class ConfigStore {
  configs = $state<Configs>({ ...DEFAULT_CONFIGS });
  rawConfig = $state<Config[]>([]);
  processing = $state(false);
  error = $state<string>();

  getCustomCss = async (): Promise<string> => {
    this.processing = true;
    return apiClient
      .get<ApiResponse>('/config/branding')
      .then(({ data: res }) => {
        const configData = res.data as Config;
        return configData.value || '';
      })
      .catch((_) => {
        this.error = 'Failed to fetch custom CSS';
        return '';
      })
      .finally(() => (this.processing = false));
  };

  refreshConfigs = async (): Promise<void> => {
    this.processing = true;
    apiClient
      .get<ApiResponse>('/config')
      .then(({ data: res }) => {
        const configData = res.data as Config[];
        this.rawConfig = configData;
        applyRawConfigs(this.configs, configData);

        // Update paraglide locale without reloading during config refresh
        try {
          if (this.configs.locale) {
            setLocale(this.configs.locale as any, { reload: false });
          }
        } catch (_) {
          /* noop */
        }
      })
      .catch((_) => (this.error = 'Failed to fetch configs'))
      .finally(() => (this.processing = false));
  };
}

export const configStore = new ConfigStore();

export default configStore.configs;
