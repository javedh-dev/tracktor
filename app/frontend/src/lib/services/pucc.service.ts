import { getApiUrl } from '$lib/helper/api';
import type { Response } from '$lib/types';
import type { PollutionCertificate } from '$lib/types/pucc';

export const savePollutionCertificate = async (
	certificate: PollutionCertificate
): Promise<Response<PollutionCertificate>> => {
	const res: Response<PollutionCertificate> = { status: 'OK' };
	try {
		const response = await fetch(
			getApiUrl(`/api/vehicles/${certificate.vehicleId}/pucc/${certificate.id || ''}`),
			{
				method: `${certificate.id ? 'PUT' : 'POST'}`,
				headers: {
					'Content-Type': 'application/json',
					'X-User-PIN': localStorage.getItem('userPin') || ''
				},
				body: JSON.stringify(certificate)
			}
		);
		if (response.ok) {
			res.data = await response.json();
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to save pollution certificate.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while saving pollution certificate : ' + e;
	}
	return res;
};

export const deletePollutionCertificate = async (
	pucc: PollutionCertificate
): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const response = await fetch(getApiUrl(`/api/vehicles/${pucc.vehicleId}/pucc/${pucc.id}`), {
			method: 'DELETE',
			headers: {
				'X-User-PIN': localStorage.getItem('userPin') || ''
			}
		});
		if (response.ok) {
			res.data = await response.json();
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to delete PUCC.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while deleting PUCC : ' + e;
	}
	return res;
};
