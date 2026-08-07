import { formatInTimeZone } from 'date-fns-tz';

// Intl omits UTC itself from the zone list, but it's the app's default timezone.
const TIMEZONES = ['UTC', ...Intl.supportedValuesOf('timeZone')];

export const getTimezoneOptions = (): {
  value: string;
  label: string;
  offset: number;
}[] => {
  const referenceDate = new Date('2024-01-01T12:00:00Z');

  return TIMEZONES.map((zone) => {
    const offset = formatInTimeZone(referenceDate, zone, 'xxx');
    return {
      value: zone,
      label: `[${offset}] ${zone}`,
      offset: Number(offset.replace(':', ''))
    };
  }).sort((a, b) => a.offset - b.offset);
};

export const isValidTimezone = (tz: string) => TIMEZONES.includes(tz);
