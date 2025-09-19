import { config } from '$lib/stores/setting';
import { format, parse } from 'date-fns';
import { TZDate } from '@date-fns/tz';

export interface ConfigStore {
	dateFormat: string;
	currency: string;
	unitOfDistance: string;
	unitOfVolume: string;
	locale: string;
	timezone: string;
}

const configs: ConfigStore = {
	dateFormat: 'dd/MM/yyyy',
	currency: 'USD',
	unitOfDistance: 'kilometer',
	unitOfVolume: 'liter',
	locale: 'en-US',
	timezone: 'UTC'
};

config.subscribe((value) => {
	if (value && value.length > 0) {
		value.forEach((item) => {
			if (item.key === 'dateFormat') {
				configs.dateFormat = item.value || configs.dateFormat;
			} else if (item.key === 'currency') {
				configs.currency = item.value || configs.currency;
			} else if (item.key === 'unitOfVolume') {
				configs.unitOfVolume = item.value || configs.unitOfVolume;
			} else if (item.key === 'unitOfDistance') {
				configs.unitOfDistance = item.value || configs.unitOfDistance;
			} else if (item.key === 'locale') {
				configs.locale = item.value || configs.locale;
			} else if (item.key === 'timezone') {
				configs.timezone = item.value || configs.timezone;
			}
		});
	}
});

const formatDate = (date: Date | string): string => {
	return format(date, configs.dateFormat);
};

const parseDate = (date: string) => {
	return parse(date, configs.dateFormat, new Date());
};

const getCurrencySymbol = (): string => {
	return (
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: configs.currency
		})
			.formatToParts(0)
			.find((part) => part.type === 'currency')?.value || ''
	);
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

const getVolumeUnit = (): string => {
	return (
		new Intl.NumberFormat(configs.locale, {
			style: 'unit',
			unit: configs.unitOfVolume
		})
			.formatToParts(0)
			.find((part) => part.type === 'unit')?.value || ''
	);
};

const formatVolume = (volume: number): string => {
	return new Intl.NumberFormat(configs.locale, {
		style: 'unit',
		unit: configs.unitOfVolume
	}).format(volume);
};

const getMileageUnit = (): string => {
	return (
		new Intl.NumberFormat(configs.locale, {
			style: 'unit',
			unit: `${configs.unitOfDistance}-per-${configs.unitOfVolume}`
		})
			.formatToParts(0)
			.find((part) => part.type === 'unit')?.value || ''
	);
};

const formatMileage = (mileage: number): string => {
	return new Intl.NumberFormat(configs.locale, {
		style: 'unit',
		unit: `${configs.unitOfDistance}-per-${configs.unitOfVolume}`
	}).format(mileage);
};

export {
	formatDate,
	parseDate,
	getCurrencySymbol,
	formatCurrency,
	getDistanceUnit,
	formatDistance,
	getVolumeUnit,
	formatVolume,
	getMileageUnit,
	formatMileage
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
