import type { RequestEvent } from '@sveltejs/kit';
import { getAppConfigs, getAppConfigByKey, updateAppConfig } from '../services/configService';

export const getConfig = async (event: RequestEvent) => {
	const configs = await getAppConfigs();
	return new Response(JSON.stringify(configs), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getConfigByKey = async (event: RequestEvent) => {
	const { key } = event.params;
	const config = await getAppConfigByKey(key as string);
	return new Response(JSON.stringify(config), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const updateConfig = async (event: RequestEvent) => {
	const configs: { key: string; value: string }[] = await event.request.json();
	const response = await updateAppConfig(configs);
	return new Response(JSON.stringify(response), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
