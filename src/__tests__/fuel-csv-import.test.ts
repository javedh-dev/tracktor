import { beforeEach, expect, it, vi } from 'vitest';
import { parseWithFormat } from '$lib/helper/date.helper';
import { fuelSchema } from '$lib/domain/fuel';

const save = vi.hoisted(() => vi.fn());
vi.mock('$lib/helper/format.helper', () => ({ parseWithFormat }));
vi.mock('$lib/services/fuel.service', () => ({ saveFuelLog: save }));
import { parseCsvPreview, importFuelLogsFromCsv } from '$lib/helper/csv.helper';

beforeEach(() => {
  save.mockReset();
  save.mockImplementation(async (payload) => {
    const valid = fuelSchema.safeParse({ ...payload, date: payload.date.toISOString() });
    return valid.success ? { status: 'OK' } : { status: 'ERROR', error: valid.error.message };
  });
});

it('imports the reported CSV after column mapping without rounding gallons (#177)', async () => {
  const csv = await parseCsvPreview(
    new File(
      ['date,price,gallons,trip_miles,odometer\n2026-01-18,28.82,11.308,288.7,118628'],
      'fuel.csv'
    ),
    { delimiter: ',', hasHeaders: true }
  );
  const rows = csv.rows.map((row) => ({
    date: row.date,
    cost: row.price,
    fuelAmount: row.gallons,
    odometer: row.odometer
  }));
  expect(
    await importFuelLogsFromCsv(rows, '123e4567-e89b-42d3-a456-426614174000', 'yyyy-MM-dd')
  ).toMatchObject({ imported: 1, failed: 0 });
  expect(save.mock.calls[0][0].fuelAmount).toBe(11.308);
});

it('accepts optional unmapped columns as the wizard promises', async () => {
  expect(
    await importFuelLogsFromCsv(
      [{ date: '2026-01-18', cost: '28.82' }],
      '123e4567-e89b-42d3-a456-426614174000',
      'yyyy-MM-dd'
    )
  ).toMatchObject({ imported: 1, failed: 0 });
});

it('reports a failed row while preserving successful rows', async () => {
  const result = await importFuelLogsFromCsv(
    [
      { date: '2026-01-18', cost: '28.82' },
      { date: 'not-a-date', cost: '28.82' },
      { date: '2026-01-18', cost: 'Infinity' }
    ],
    '123e4567-e89b-42d3-a456-426614174000',
    'yyyy-MM-dd'
  );
  expect(result).toMatchObject({ imported: 1, failed: 2 });
  expect(result.errors).toHaveLength(2);
});
