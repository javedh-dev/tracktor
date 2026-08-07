import { z } from 'zod';

/**
 * Validates date strings accepted by the API: anything the Date
 * constructor can parse (ISO 8601 payloads from JSON-serialized Dates).
 * Display-format validation for forms lives in format.helper (client-only).
 */
export const apiDateString = z
  .string()
  .refine((val) => !Number.isNaN(new Date(val).getTime()), 'Invalid date format');

/** Nullable/optional variant for fields that can be empty or omitted. */
export const optionalApiDateString = apiDateString.nullable().optional();

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
