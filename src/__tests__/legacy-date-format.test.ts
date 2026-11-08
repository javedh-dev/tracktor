import { expect, it } from 'vitest';
import { dateStringForFormat } from '$lib/domain/shared';
import { parseWithFormat, formatDate, parseDate, type FormatConfig } from '$lib/helper/date.helper';

const config: FormatConfig = {
  dateFormat: 'dd.MM.Y',
  timezone: 'Europe/Berlin',
  locale: 'de',
  currency: 'EUR',
  unitOfVolume: 'liter',
  unitOfLpg: 'liter',
  unitOfCng: 'kilogram',
  unitOfDistance: 'kilometer',
  mileageUnitFormat: 'distance-per-fuel'
};

it.each(['dd.MM.Y', 'dd.MM.YYY', 'dd.MM.yyyy'])(
  'accepts the reported German date with %s (#264)',
  (fmt) => {
    expect(dateStringForFormat(fmt).safeParse('08.09.2026').success).toBe(true);
    expect(parseWithFormat('08.09.2026', fmt)).not.toBeNull();
  }
);

it('uses calendar years at the year boundary and preserves quoted literals', () => {
  const date = new Date('2026-12-31T12:00:00Z');
  expect(formatDate(date, config)).toBe('31.12.2026');
  expect(formatDate(date, { ...config, dateFormat: "dd.MM.Y 'Y'" })).toBe('31.12.2026 Y');
  expect(parseDate('08.09.2026', config).toISOString()).toBe('2026-09-07T22:00:00.000Z');
  expect(dateStringForFormat('dd.MM.Y').safeParse('31.02.2026').success).toBe(false);
});
