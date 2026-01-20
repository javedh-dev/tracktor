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

const UNIT_LABEL_FALLBACKS: Record<string, string> = {
	liter: 'L',
	gallon: 'gal',
	kilogram: 'kg',
	pound: 'lb',
	kilometer: 'km',
	mile: 'mi'
};

const safeUnitLabel = (unit: string): string => {
	try {
		return (
			new Intl.NumberFormat(configs.locale, {
				style: 'unit',
				unit
			})
				.formatToParts(0)
				.find((part) => part.type === 'unit')?.value ||
			UNIT_LABEL_FALLBACKS[unit] ||
			unit
		);
	} catch (_) {
		return UNIT_LABEL_FALLBACKS[unit] || unit;
	}
};

const safeUnitFormat = (value: number, unit: string): string | null => {
	try {
		return new Intl.NumberFormat(configs.locale, { style: 'unit', unit }).format(value);
	} catch (_) {
		return null;
	}
};

const getFuelVolumeUnit = (fuelType: string): string => {
	switch (fuelType) {
		case 'lpg':
			return configs.unitOfLpg || configs.unitOfVolume;
		case 'cng':
			return configs.unitOfCng || configs.unitOfVolume;
		default:
			return configs.unitOfVolume;
	}
};

const getDistanceUnit = (): string => {
	return safeUnitLabel(configs.unitOfDistance);
};

const formatDistance = (distance: number): string => {
	return (
		safeUnitFormat(distance, configs.unitOfDistance) ||
		`${distance} ${safeUnitLabel(configs.unitOfDistance)}`
	);
};

const getFuelUnit = (vehicleType: string): string => {
	if (vehicleType === 'electric') {
		return 'kWh';
	}
	return safeUnitLabel(getFuelVolumeUnit(vehicleType));
};

const formatFuel = (amount: number, vehicleType: string): string => {
	if (vehicleType === 'electric') {
		return `${amount.toFixed(3)} kWh`;
	}

	const fuelUnit = getFuelVolumeUnit(vehicleType);
	return safeUnitFormat(amount, fuelUnit) || `${amount.toFixed(2)} ${safeUnitLabel(fuelUnit)}`;
};

const getMileageUnit = (vehicleType: string): string => {
	if (vehicleType === 'electric') {
		return 'km/kWh';
	}
	const fuelUnit = getFuelVolumeUnit(vehicleType);
	const mileageUnit = `${configs.unitOfDistance}-per-${fuelUnit}`;
	const label = safeUnitLabel(mileageUnit);
	return label === mileageUnit
		? `${safeUnitLabel(configs.unitOfDistance)}/${safeUnitLabel(fuelUnit)}`
		: label;
};

const formatMileage = (mileage: number, vehicleType: string): string => {
	if (vehicleType === 'electric') {
		return `${mileage.toFixed(3)} km/kWh`;
	}
	const fuelUnit = getFuelVolumeUnit(vehicleType);
	const mileageUnit = `${configs.unitOfDistance}-per-${fuelUnit}`;
	return (
		safeUnitFormat(mileage, mileageUnit) ||
		`${mileage.toFixed(2)} ${safeUnitLabel(configs.unitOfDistance)}/${safeUnitLabel(fuelUnit)}`
	);
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
