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
  notificationProcessingSchedule: '0 9 * * *',
  notificationEmailSubjectTemplate:
    'Tracktor: {{total_count}} pending notification{{plural_suffix}}',
  notificationEmailTextTemplate:
    'Tracktor Notification Summary\n=====================================\n\n{{summary_sentence}}\n\n{{notification_groups_text}}\nReview details in Tracktor to manage your notifications.',
  notificationEmailHtmlTemplate:
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>{{email_title}}</title>\n</head>\n<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;color:#101828;">\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;">\n<tr><td align="center" style="padding:40px 20px;">\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e4e7ec;border-radius:20px;overflow:hidden;">\n<tr><td style="padding:36px 32px 18px 32px;">\n<div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#667085;font-weight:600;margin-bottom:14px;">Tracktor</div>\n<h1 style="margin:0;font-size:28px;line-height:1.2;color:#101828;font-weight:700;">Notification Summary</h1>\n<p style="margin:12px 0 0 0;font-size:15px;line-height:1.7;color:#475467;">{{summary_sentence}}</p>\n</td></tr>\n<tr><td style="padding:0 32px 32px 32px;">\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;border:1px solid #eaecf0;border-radius:16px;margin-top:18px;">\n<tr><td style="padding:20px 22px;text-align:center;">\n<div style="font-size:34px;line-height:1;font-weight:700;color:#101828;margin-bottom:6px;">{{total_count}}</div>\n<p style="font-size:14px;line-height:1.5;color:#475467;margin:0;font-weight:500;">Pending Notification{{plural_suffix}}</p>\n</td></tr>\n</table>\n{{notification_groups_html}}\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px;border-top:1px solid #eaecf0;">\n<tr><td style="padding-top:20px;text-align:left;">\n<p style="margin:0;font-size:13px;line-height:1.7;color:#667085;">Open Tracktor to review details, mark items as read, and manage your vehicles.</p>\n</td></tr>\n</table>\n</td></tr>\n</table>\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin-top:24px;">\n<tr><td style="text-align:center;padding:0 20px;">\n<p style="font-size:12px;line-height:1.6;color:#98a2b3;margin:0 0 4px 0;">This is an automated message from Tracktor</p>\n<p style="font-size:11px;line-height:1.6;color:#98a2b3;margin:0;">Please do not reply to this email</p>\n</td></tr>\n</table>\n</td></tr>\n</table>\n</body>\n</html>'
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
