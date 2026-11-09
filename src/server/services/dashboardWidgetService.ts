import { type AccessContext, requireAdmin } from './access';
import { getAppConfigByKey, updateAppConfig } from './configService';
import {
  DEFAULT_WIDGET_LAYOUT,
  widgetLayoutSchema,
  type WidgetLayoutItem
} from '$lib/domain/dashboard';

const LAYOUT_CONFIG_KEY = 'dashboardLayout';

export async function getWidgetLayout(): Promise<WidgetLayoutItem[]> {
  try {
    const row = await getAppConfigByKey(LAYOUT_CONFIG_KEY);
    const parsed = widgetLayoutSchema.safeParse(JSON.parse(row.value));
    // Falls back to defaults for layouts saved before colSpan/rowSpan became numeric (1-12).
    return parsed.success ? parsed.data : DEFAULT_WIDGET_LAYOUT;
  } catch {
    return DEFAULT_WIDGET_LAYOUT;
  }
}

export async function saveWidgetLayout(
  access: AccessContext,
  layout: WidgetLayoutItem[]
): Promise<WidgetLayoutItem[]> {
  requireAdmin(access);
  await updateAppConfig(access, [{ key: LAYOUT_CONFIG_KEY, value: JSON.stringify(layout) }]);
  return layout;
}
