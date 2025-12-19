export interface Config {
	key: string;
	value?: string;
	description?: string;
}

export interface Configs {
	dateFormat: string;
	currency: string;
	unitOfDistance: string;
	unitOfVolume: string;
	locale: string;
	timezone: string;
	customCss?: string;
}
