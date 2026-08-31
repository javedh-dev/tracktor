import { z } from 'zod';
import { parseWithFormat } from '$lib/helper/date.helper';
import { format, isValid, parseISO } from 'date-fns';

/**
 * Validates ISO 8601 date strings accepted by the API, including payloads
 * produced by JSON-serialized Dates.
 * Display-format validation for forms lives in format.helper (client-only).
 */
export const apiDateString = z
  .string()
  .refine((value) => isValid(parseISO(value)), 'Invalid date format');

/** Nullable/optional variant for fields that can be empty or omitted. */
export const optionalApiDateString = apiDateString.nullable().optional();

/** Validates a date exactly as it is displayed in a localized form. */
export const dateStringForFormat = (dateFormat: string) =>
  z.string().refine(
    (value) => {
      const parsed = parseWithFormat(value, dateFormat);
      return parsed !== null && format(parsed, dateFormat) === value;
    },
    { message: `Invalid date. Expected format: ${dateFormat}` }
  );

/** Nullable/optional localized date used by form-only schemas. */
export const optionalDateStringForFormat = (dateFormat: string) =>
  dateStringForFormat(dateFormat).nullable().optional();

export type DataPoint = {
  x: Date | string;
  y: number | null;
};

/** Result envelope returned by the client-side `$lib/services/*` layer. */
export type Response<DataType> = {
  status: 'OK' | 'ERROR';
  data?: DataType;
  error?: string;
};
