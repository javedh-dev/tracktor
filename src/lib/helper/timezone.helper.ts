import { formatInTimeZone } from 'date-fns-tz';
import { CANONICAL_TIMEZONES } from '$lib/constants/timezones';

export const getTimezoneOptions = (): {
  value: string;
  label: string;
  offset: number;
}[] => {
  const referenceDate = new Date('2024-01-01T12:00:00Z');

  return CANONICAL_TIMEZONES.map((zone) => {
    try {
      const offset = formatInTimeZone(referenceDate, zone, 'xxx');
      return {
        value: zone,
        label: `[${offset}] ${zone}`,
        offset: Number(offset.replace(':', ''))
      };
    } catch (e) {
      return {
        value: zone,
        label: zone,
        offset: 0
      };
    }
  }).sort((a, b) => a.offset - b.offset);
};

export const isValidTimezone = (tz: string) => {
  return CANONICAL_TIMEZONES.includes(tz as any);
};
