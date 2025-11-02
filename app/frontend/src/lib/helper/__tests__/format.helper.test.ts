import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { writable } from 'svelte/store';
import {
	formatDate,
	formatDateForCalendar,
	parseDate,
	isValidFormat,
	getTimezoneOptions,
	isValidTimezone,
	getCurrencySymbol,
	formatCurrency,
	getDistanceUnit,
	formatDistance,
	getFuelUnit,
	formatFuel,
	getMileageUnit,
	formatMileage,
	cleanup
} from '../format.helper';
import { CalendarDate } from '@internationalized/date';

// Mock the config store
vi.mock('$lib/stores/setting', () => ({
	config: writable([])
}));

vi.mock('$env/dynamic/public', () => ({
	env: {
		TRACKTOR_API_BASE_URL: 'https://api.test.com'
	}
}));

// Mock DateValue for calendar tests
const mockDateValue = {
	toDate: vi.fn().mockReturnValue(new Date('2024-01-15T10:30:00Z'))
};

describe('Format Helper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset Intl mocks
		if (!Intl.supportedValuesOf) {
			Intl.supportedValuesOf = vi
				.fn()
				.mockReturnValue(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
		}
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('formatDate', () => {
		it('should format Date object correctly', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = formatDate(date);
			expect(result).toMatch(/15\/01\/2024/);
		});

		it('should format string date correctly', () => {
			const dateString = '2024-01-15T10:30:00Z';
			const result = formatDate(dateString);
			expect(result).toMatch(/15\/01\/2024/);
		});

		it('should handle invalid date strings and return as is', () => {
			const invalidDate = 'invalid-date';
			expect(() => formatDate(invalidDate)).not.toThrow();
		});
	});

	describe('formatDateForCalendar', () => {
		it('should format DateValue correctly', () => {
			const result = formatDateForCalendar(new CalendarDate(2025, 5, 20));
			expect(result).toMatch(/20\/05\/2025/);
		});
	});

	describe('parseDate', () => {
		it('should parse date string correctly', () => {
			const dateString = '15/01/2024';
			const result = parseDate(dateString);
			expect(result).toBeInstanceOf(Date);
			expect(result.getFullYear()).toBe(2024);
		});

		it('should handle invalid date format', () => {
			const invalidDate = 'invalid';
			expect(() => parseDate(invalidDate)).not.toThrow();
		});
	});

	describe('isValidFormat', () => {
		it('should return valid for correct format', () => {
			const result = isValidFormat('dd/MM/yyyy');
			expect(result.valid).toBe(true);
			expect(result.ex).toBeDefined();
		});

		it('should return invalid for incorrect format', () => {
			const result = isValidFormat('invalid-format');
			expect(result.valid).toBe(false);
			expect(result.ex).toBeUndefined();
		});

		it('should provide example for valid format', () => {
			const result = isValidFormat('yyyy-MM-dd');
			expect(result.valid).toBe(true);
			expect(result.ex).toMatch(/\d{4}-\d{2}-\d{2}/);
		});
	});

	describe('getTimezoneOptions', () => {
		it('should return timezone options when supported', () => {
			const options = getTimezoneOptions();
			expect(Array.isArray(options)).toBe(true);
			expect(options.length).toBeGreaterThan(0);

			if (options.length > 0) {
				expect(options[0]).toHaveProperty('value');
				expect(options[0]).toHaveProperty('label');
				expect(options[0]).toHaveProperty('offset');
			}
		});

		it('should return empty array when not supported', () => {
			const originalSupportedValuesOf = Intl.supportedValuesOf;
			// @ts-expect-error to simulate unsupported environment
			delete Intl.supportedValuesOf;

			const options = getTimezoneOptions();
			expect(options).toEqual([]);

			Intl.supportedValuesOf = originalSupportedValuesOf;
		});

		it('should sort timezones by offset', () => {
			const options = getTimezoneOptions();
			if (options.length > 1) {
				for (let i = 1; i < options.length; i++) {
					expect(options[i].offset).toBeGreaterThanOrEqual(options[i - 1].offset);
				}
			}
		});
	});

	describe('isValidTimezone', () => {
		it('should return true for valid timezone', () => {
			const result = isValidTimezone('America/New_York');
			expect(result).toBe(true);
		});

		it('should return false for invalid timezone', () => {
			const result = isValidTimezone('Invalid/Timezone');
			expect(result).toBe(false);
		});

		it('should return true when supportedValuesOf is not available', () => {
			const originalSupportedValuesOf = Intl.supportedValuesOf;
			// @ts-expect-error to simulate unsupported environment
			delete Intl.supportedValuesOf;

			const result = isValidTimezone('Any/Timezone');
			expect(result).toBe(true);

			Intl.supportedValuesOf = originalSupportedValuesOf;
		});
	});

	describe('getCurrencySymbol', () => {
		it('should return currency symbol for USD', () => {
			const symbol = getCurrencySymbol('USD');
			expect(symbol).toBe('$');
		});

		it('should return currency symbol for EUR', () => {
			const symbol = getCurrencySymbol('EUR');
			expect(symbol).toBe('€');
		});

		it('should return default currency symbol when no currency provided', () => {
			const symbol = getCurrencySymbol();
			expect(typeof symbol).toBe('string');
		});

		it('should handle invalid currency codes', () => {
			expect(() => getCurrencySymbol('INVALID')).not.toThrow();
		});
	});

	describe('formatCurrency', () => {
		it('should format positive amount correctly', () => {
			const result = formatCurrency(1234.56);
			expect(result).toMatch(/\$1,234\.56/);
		});

		it('should format negative amount correctly', () => {
			const result = formatCurrency(-1234.56);
			expect(result).toMatch(/-\$1,234\.56/);
		});

		it('should format zero correctly', () => {
			const result = formatCurrency(0);
			expect(result).toMatch(/\$0\.00/);
		});
	});

	describe('getDistanceUnit', () => {
		it('should return distance unit', () => {
			const unit = getDistanceUnit();
			expect(typeof unit).toBe('string');
		});
	});

	describe('formatDistance', () => {
		it('should format distance correctly', () => {
			const result = formatDistance(100);
			expect(result).toMatch(/100/);
		});

		it('should format decimal distance correctly', () => {
			const result = formatDistance(100.5);
			expect(result).toMatch(/100\.5/);
		});
	});

	describe('getFuelUnit', () => {
		it('should return fuel unit', () => {
			const unit = getFuelUnit('petrol');
			expect(typeof unit).toBe('string');
		});
	});

	describe('formatFuel', () => {
		it('should format fuel correctly', () => {
			const result = formatFuel(50, 'petrol');
			expect(result).toMatch(/50/);
		});

		it('should format decimal volume correctly', () => {
			const result = formatFuel(50.75, 'ev');
			expect(result).toMatch(/50\.75/);
		});
	});

	describe('getMileageUnit', () => {
		it('should return mileage unit', () => {
			const unit = getMileageUnit('petrol');
			expect(typeof unit).toBe('string');
		});
	});

	describe('formatMileage', () => {
		it('should format mileage correctly', () => {
			const result = formatMileage(25, 'petrol');
			expect(result).toMatch(/25/);
		});

		it('should format decimal mileage correctly', () => {
			const result = formatMileage(25.5, 'petrol');
			expect(result).toMatch(/25\.5/);
		});
	});

	describe('cleanup', () => {
		it('should convert empty strings to null', () => {
			const input = { name: 'John', email: '', phone: '   ' };
			const result = cleanup(input);
			expect(result).toEqual({ name: 'John', email: null, phone: null });
		});

		it('should convert undefined values to null', () => {
			const input = { name: 'John', email: undefined, age: 25 };
			const result = cleanup(input);
			expect(result).toEqual({ name: 'John', email: null, age: 25 });
		});

		it('should preserve valid values', () => {
			const input = { name: 'John', age: 25, active: false, score: 0 };
			const result = cleanup(input);
			expect(result).toEqual({ name: 'John', age: 25, active: false, score: 0 });
		});

		it('should handle nested objects', () => {
			const input = { user: { name: 'John', email: '' }, count: 5 };
			const result = cleanup(input);
			expect(result.user).toEqual({ name: 'John', email: '' }); // Doesn't deep clean
			expect(result.count).toBe(5);
		});

		it('should handle empty object', () => {
			const result = cleanup({});
			expect(result).toEqual({});
		});
	});
});
