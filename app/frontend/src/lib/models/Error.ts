import type { Status } from './status';

export type ApiError = {
	type: string;
	errors: {
		message: string;
		path?: string;
	}[];
};

export const handleApiError = (data: ApiError, editMode: boolean): Status => {
	console.log(JSON.stringify(data));
	let message = data.errors.map((e) => e.path + ' : ' + e.message).join('\n');
	return {
		message: message || `Failed to ${editMode ? 'update' : 'add'} vehicle.`,
		type: 'ERROR'
	};
};
