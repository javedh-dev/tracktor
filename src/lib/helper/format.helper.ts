import configs from '$stores/config.svelte';
import type { DateValue } from '@internationalized/date';
import { format, parse } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const formatDate = (date: Date | string): string => {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	try {
		return formatInTimeZone(dateObj, configs.timezone, configs.dateFormat);
	} catch (e) {
		return '';
	}
};

const formatDateForCalendar = (date: DateValue): string => {
	const dateObj = date.toDate(configs.timezone);
	return format(dateObj, configs.dateFormat);
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

const getTimezoneOptions = (): { value: string; label: string; offset: number }[] => {
	if (typeof Intl.supportedValuesOf === 'function') {
		return Intl.supportedValuesOf('timeZone')
			.map((zone) => {
				const offset = formatInTimeZone(new Date(), zone, 'xxx');
				return {
					value: zone,
					label: `[${offset}] ${zone}`,
					offset: Number(offset.replace(':', ''))
				};
			})
			.sort((a, b) => a.offset - b.offset);
	} else {
		return [];
	}
};

const isValidTimezone = (tz: string) => {
	if (typeof Intl.supportedValuesOf === 'function') {
		return Intl.supportedValuesOf('timeZone').includes(tz);
	}
	return true;
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
	if (vehicleType === 'ev') {
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
	if (vehicleType === 'ev') {
		return `${amount.toFixed(3)} kWh`;
	}
	return new Intl.NumberFormat(configs.locale, {
		style: 'unit',
		unit: configs.unitOfVolume
	}).format(amount);
};

const getMileageUnit = (vehicleType: string): string => {
	if (vehicleType === 'ev') {
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
	if (vehicleType === 'ev') {
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
	roundNumber
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
