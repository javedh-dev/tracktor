import type { DateValue } from '@internationalized/date';
import { format, parse } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { ar, cs, de, enUS, es, fi, fr, hi, hu, it, pt, ro, ru } from 'date-fns/locale';

export interface FormatConfig {
  dateFormat: string;
  timezone: string;
  locale: string;
  currency: string;
  unitOfVolume: string;
  unitOfLpg: string;
  unitOfCng: string;
  unitOfDistance: string;
  mileageUnitFormat: string;
}

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekStartDaySetting = 'locale' | `${WeekStartsOn}`;

const WEEK_START_VALUES: Record<string, WeekStartsOn> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6
};

const LOCALE_WEEK_START_FALLBACKS: Record<string, WeekStartsOn> = {
  ar: 6,
  cs: 1,
  de: 1,
  en: 0,
  es: 1,
  fi: 1,
  fr: 1,
  hi: 0,
  hu: 1,
  it: 1,
  'pt-PT': 1,
  ro: 1,
  ru: 1
};

const getWeekStartFromIntl = (locale: string): WeekStartsOn | undefined => {
  try {
    type LocaleWithWeekInfo = Intl.Locale & { weekInfo?: { firstDay?: number } };
    const firstDay = (new Intl.Locale(locale) as LocaleWithWeekInfo).weekInfo?.firstDay;
    if (typeof firstDay !== 'number') return undefined;
    const weekStartsOn = firstDay % 7;
    return WEEK_START_VALUES[String(weekStartsOn)];
  } catch (_) {
    return undefined;
  }
};

export const resolveWeekStartsOn = (setting: unknown, locale: string): WeekStartsOn => {
  if (typeof setting === 'string' && setting in WEEK_START_VALUES) {
    return WEEK_START_VALUES[setting];
  }

  const intlValue = getWeekStartFromIntl(locale);
  if (intlValue !== undefined) return intlValue;

  return (
    LOCALE_WEEK_START_FALLBACKS[locale] ?? LOCALE_WEEK_START_FALLBACKS[locale.split('-')[0]] ?? 0
  );
};

const getDateFnsLocale = (locale: string) => {
  switch (locale) {
    case 'ar':
      return ar;
    case 'cs':
      return cs;
    case 'de':
      return de;
    case 'es':
      return es;
    case 'fi':
      return fi;
    case 'fr':
      return fr;
    case 'hi':
      return hi;
    case 'hu':
      return hu;
    case 'it':
      return it;
    case 'pt-PT':
      return pt;
    case 'ro':
      return ro;
    case 'ru':
      return ru;
    case 'en':
      return enUS;
    default:
      return undefined;
  }
};

export const formatDate = (date: Date | string, config: FormatConfig): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  try {
    const zonedDate = formatInTimeZone(dateObj, config.timezone, 'yyyy-MM-dd HH:mm:ss');
    const parsedDate = parse(zonedDate, 'yyyy-MM-dd HH:mm:ss', new Date());
    return format(parsedDate, config.dateFormat, {
      locale: getDateFnsLocale(config.locale)
    });
  } catch (e) {
    return '';
  }
};

export const formatDateForCalendar = (date: DateValue, config: FormatConfig): string => {
  const dateObj = date.toDate(config.timezone);
  return format(dateObj, config.dateFormat, { locale: getDateFnsLocale(config.locale) });
};

export const parseDate = (date: string, config: FormatConfig) => {
  const parsedDate = parse(date, config.dateFormat, new Date());
  return fromZonedTime(parsedDate, config.timezone);
};

export const isValidFormat = (fmt: string): { ex?: string; valid: boolean } => {
  try {
    return {
      ex: format(new Date(), fmt),
      valid: true
    };
  } catch (_) {
    return { valid: false };
  }
};

export const parseWithFormat = (dateStr: string, fmt: string): Date | null => {
  try {
    const parsed = parse(dateStr, fmt, new Date());
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (_) {
    return null;
  }
};
