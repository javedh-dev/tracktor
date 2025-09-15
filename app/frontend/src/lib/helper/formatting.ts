import { config } from '$stores/config';
import { format, parse } from 'date-fns';

export interface ConfigStore {
	dateFormat: string;
	currency: string;
	unitOfMeasure?: string;
}

const configs: ConfigStore = {
	dateFormat: 'dd/MM/yyyy',
	currency: 'USD',
	unitOfMeasure: 'metric'
};

config.subscribe((value) => {
	if (value && value.length > 0) {
		value.forEach((item) => {
			if (item.key === 'dateFormat') {
				configs.dateFormat = item.value || configs.dateFormat;
			} else if (item.key === 'currency') {
				configs.currency = item.value || configs.currency;
			} else if (item.key === 'unitOfMeasure') {
				configs.unitOfMeasure = item.value || configs.unitOfMeasure;
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
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: configs.currency
	}).format(amount);
};

const getDistanceUnit = (): string => {
	if (configs.unitOfMeasure === 'metric') {
		return 'km';
	}
	if (configs.unitOfMeasure === 'imperial') {
		return 'mi';
	}
	return '';
};

const formatDistance = (distance: number): string => {
	if (configs.unitOfMeasure === 'metric') {
		return `${distance} km`;
	} else if (configs.unitOfMeasure === 'imperial') {
		return `${distance} mi`;
	}
	return `${distance}`;
};

const getVolumeUnit = (): string => {
	if (configs.unitOfMeasure === 'metric') {
		return 'l';
	}
	if (configs.unitOfMeasure === 'imperial') {
		return 'gal';
	}
	return '';
};

const formatVolume = (volume: number): string => {
	if (configs.unitOfMeasure === 'metric') {
		return `${volume.toFixed(2)} l`;
	} else if (configs.unitOfMeasure === 'imperial') {
		return `${volume} gal`;
	}
	return `${volume}`;
};

const getMileageUnit = (): string => {
	if (configs.unitOfMeasure === 'metric') {
		return 'kmpl';
	}
	if (configs.unitOfMeasure === 'imperial') {
		return 'mpg';
	}
	return '';
};

const formatMileage = (mileage: number): string => {
	if (configs.unitOfMeasure === 'metric') {
		return `${mileage} kmpl`;
	} else if (configs.unitOfMeasure === 'imperial') {
		return `${mileage} mpg`;
	}
	return `${mileage}`;
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
