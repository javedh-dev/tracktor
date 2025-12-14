import type { Response, PollutionCertificate } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import { uploadFile } from './file.service';

export const savePuccWithAttachment = async (
	certificate: PollutionCertificate,
	attachment: File | undefined
): Promise<Response<PollutionCertificate>> => {
	if (attachment) {
		try {
			const res = await uploadFile(attachment);
			certificate.attachment = res.data.filename || null;
		} catch (e: any) {
			return {
				status: 'ERROR',
				error: e.response?.data?.message || 'Failed to upload attachment'
			};
		}
	}
	return savePucc(certificate);
};

export const savePucc = async (
	certificate: PollutionCertificate
): Promise<Response<PollutionCertificate>> => {
	const res: Response<PollutionCertificate> = { status: 'OK' };
	try {
		const method = certificate.id ? 'PUT' : 'POST';
		const url = `/vehicles/${certificate.vehicleId}/pucc/${certificate.id || ''}`;

		const response = await apiClient[method.toLowerCase() as 'put' | 'post'](url, certificate);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to save pollution certificate.';
	}
	return res;
};

export const deletePucc = async (pucc: PollutionCertificate): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const response = await apiClient.delete(`/vehicles/${pucc.vehicleId}/pucc/${pucc.id}`);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to delete PUCC.';
	}
	return res;
};
// Backward compatibility aliases
export const savePollutionCertificate = savePucc;
export const savePollutionCertificateWithAttachment = savePuccWithAttachment;
export const deletePollutionCertificate = deletePucc;
