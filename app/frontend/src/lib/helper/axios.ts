import axiosCore, { type AxiosResponse } from 'axios';
import { getApiUrl } from './api';
import type { ApiResponse } from '@tracktor/common';
import { toast } from 'svelte-sonner';

const createAxiosInstnace = () => {
	const axiosConfig = {
		baseURL: getApiUrl('/api'),
		headers: {
			post: {
				'Content-Type': 'application/json'
			}
		},
		timeout: 30000
	};

	const axios = axiosCore.create(axiosConfig);

	axios.interceptors.response.use(
		(response: AxiosResponse<ApiResponse>) => {
			if (response.data.message) {
				toast.success(response.data.message);
			}
			return response;
		},
		(error) => {
			if (error.response.data.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error(`${error.status} : ${error.message}`);
			}
			throw error;
		}
	);
	return axios;
};

const axios = createAxiosInstnace();

export { axios, createAxiosInstnace };
