import { getApiUrl } from '$lib/helper/api';

export const isPinSet = async () => {
	try {
		const response = await fetch(getApiUrl('/api/pin/status'));
		if (response.ok) {
			const data = await response.json();
			return data.exists;
		}
		return false;
	} catch (e) {
		console.error(e);
		return false;
	}
};

export const verifyPin = async (pin: string) => {
	const response = await fetch(getApiUrl('/api/pin/verify'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ pin })
	});
	return response.ok;
};
