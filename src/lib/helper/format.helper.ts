import configs from '$stores/config.svelte';
import type { DateValue } from '@internationalized/date';
import { format, parse } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { es, fr, de, hi } from 'date-fns/locale';
import { CANONICAL_TIMEZONES } from '$lib/constants/timezones';

const getDateFnsLocale = () => {
	switch (configs.locale) {
		case 'es':
			return es;
		case 'fr':
			return fr;
		case 'de':
			return de;
		case 'hi':
			return hi;
		case 'en':
		default:
			return undefined; // English is the default locale in date-fns
	}
};

const formatDate = (date: Date | string): string => {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	try {
		const zonedDate = formatInTimeZone(dateObj, configs.timezone, 'yyyy-MM-dd HH:mm:ss');
		const parsedDate = parse(zonedDate, 'yyyy-MM-dd HH:mm:ss', new Date());
		return format(parsedDate, configs.dateFormat, { locale: getDateFnsLocale() });
	} catch (e) {
		return '';
	}
};

const formatDateForCalendar = (date: DateValue): string => {
	const dateObj = date.toDate(configs.timezone);
	return format(dateObj, configs.dateFormat, { locale: getDateFnsLocale() });
};

const parseDate = (date: string) => {
	const parsedDate = parse(date, configs.dateFormat, new Date());
	return fromZonedTime(parsedDate, configs.timezone);
};

const isValidFormat = (fmt: string): { ex?: string; valid: boolean } => {
	try {
		return {
			ex: format(new Date(), fmt),
			valid: true
		};
	} catch (_) {
		return { valid: false };
	}
};

const parseWithFormat = (dateStr: string, fmt: string): Date | null => {
	try {
		const parsed = parse(dateStr, fmt, new Date());
		return isNaN(parsed.getTime()) ? null : parsed;
	} catch (_) {
		return null;
	}
};

const getTimezoneOptions = (): { value: string; label: string; offset: number }[] => {
	// Use a fixed reference date (Jan 1, 2024 UTC) to ensure consistent timezone offsets
	// across all platforms and avoid DST variations
	const referenceDate = new Date('2024-01-01T12:00:00Z');

	// Use canonical timezone list instead of Intl.supportedValuesOf to ensure
	// consistency across all operating systems and Node.js versions
	return CANONICAL_TIMEZONES.map((zone) => {
		try {
			const offset = formatInTimeZone(referenceDate, zone, 'xxx');
			return {
				value: zone,
				label: `[${offset}] ${zone}`,
				offset: Number(offset.replace(':', ''))
			};
		} catch (e) {
			// Fallback for any timezone that might not be supported
			return {
				value: zone,
				label: zone,
				offset: 0
			};
		}
	}).sort((a, b) => a.offset - b.offset);
};

const isValidTimezone = (tz: string) => {
	// Check against canonical timezone list for consistency across all platforms
	return CANONICAL_TIMEZONES.includes(tz as any);
};

const getCurrencySymbol = (currency?: string): string => {
	try {
		return (
			new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: currency || configs.currency
			})
				.formatToParts(0)
				.find((part) => part.type === 'currency')?.value || ''
		);
	} catch (e) {
		// console.debug('Unable to find currency Symbol : ', currency);
		return '';
	}
};

const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat(configs.locale, {
		style: 'currency',
		currency: configs.currency
	}).format(amount);
};

const getDistanceUnit = (): string => {
	return (
		new Intl.NumberFormat(configs.locale, {
			style: 'unit',
			unit: configs.unitOfDistance
		})
			.formatToParts(0)
			.find((part) => part.type === 'unit')?.value || ''
	);
};

const formatDistance = (distance: number): string => {
	return new Intl.NumberFormat(configs.locale, {
		style: 'unit',
		unit: configs.unitOfDistance
	}).format(distance);
};

const getFuelUnit = (vehicleType: string): string => {
	if (vehicleType === 'electric') {
		return 'kWh';
	}
	return (
		new Intl.NumberFormat(configs.locale, {
			style: 'unit',
			unit: configs.unitOfVolume
		})
			.formatToParts(0)
			.find((part) => part.type === 'unit')?.value || ''
	);
};

const formatFuel = (amount: number, vehicleType: string): string => {
	if (vehicleType === 'electric') {
		return `${amount.toFixed(3)} kWh`;
	}
	return new Intl.NumberFormat(configs.locale, {
		style: 'unit',
		unit: configs.unitOfVolume
	}).format(amount);
};

const getMileageUnit = (vehicleType: string): string => {
	if (vehicleType === 'electric') {
		return 'km/kWh';
	}
	return (
		new Intl.NumberFormat(configs.locale, {
			style: 'unit',
			unit: `${configs.unitOfDistance}-per-${configs.unitOfVolume}`
		})
			.formatToParts(0)
			.find((part) => part.type === 'unit')?.value || ''
	);
};

const formatMileage = (mileage: number, vehicleType: string): string => {
	if (vehicleType === 'electric') {
		return `${mileage.toFixed(3)} km/kWh`;
	}
	return new Intl.NumberFormat(configs.locale, {
		style: 'unit',
		unit: `${configs.unitOfDistance}-per-${configs.unitOfVolume}`
	}).format(mileage);
};

const roundNumber = (num: number, decimal: number = 2): number => {
	return Number(num.toFixed(2));
};

export {
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
	roundNumber,
	parseWithFormat
};

export const cleanup = (obj: Record<string, any>): Record<string, any> => {
	const result: Record<string, any> = { ...obj };
	for (const key in result) {
		if (
			result.hasOwnProperty(key) &&
			(String(result[key]).trim() === '' || result[key] === undefined)
		) {
			result[key] = null;
		}
	}
	return result;
};
