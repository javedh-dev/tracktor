import type {
	CreateNotificationProvider,
	UpdateNotificationProvider,
	NotificationProviderWithParsedConfig,
	EmailProviderConfig
} from '$lib/domain/notification-provider';
import { apiClient } from '$lib/helper/api.helper';

export const getProviders = async (): Promise<NotificationProviderWithParsedConfig[]> => {
	try {
		const response = await apiClient.get('/notification-providers');
		// ApiResponse structure: { success, message, data }
		// HttpClient wraps it as: { data: ApiResponse, status, ... }
		return response.data.data || [];
	} catch (error) {
		console.error('Failed to fetch notification providers:', error);
		throw error;
	}
};

export const getProvider = async (id: string): Promise<NotificationProviderWithParsedConfig> => {
	try {
		const response = await apiClient.get(`/notification-providers/${id}`);
		return response.data.data;
	} catch (error) {
		console.error('Failed to fetch notification provider:', error);
		throw error;
	}
};

export const createProvider = async (
	provider: CreateNotificationProvider
): Promise<NotificationProviderWithParsedConfig> => {
	try {
		const response = await apiClient.post('/notification-providers', provider);
		return response.data.data;
	} catch (error) {
		console.error('Failed to create notification provider:', error);
		throw error;
	}
};

export const updateProvider = async (
	id: string,
	updates: UpdateNotificationProvider
): Promise<NotificationProviderWithParsedConfig> => {
	try {
		const response = await apiClient.put(`/notification-providers/${id}`, updates);
		return response.data.data;
	} catch (error) {
		console.error('Failed to update notification provider:', error);
		throw error;
	}
};

export const deleteProvider = async (id: string): Promise<void> => {
	try {
		await apiClient.delete(`/notification-providers/${id}`);
	} catch (error) {
		console.error('Failed to delete notification provider:', error);
		throw error;
	}
};

export const testEmailProvider = async (
	config: EmailProviderConfig,
	testEmail: string
): Promise<{ success: boolean; error?: string }> => {
	try {
		const response = await apiClient.post('/notification-providers/test-email', {
			config,
			testEmail
		});
		return response.data.data;
	} catch (error) {
		console.error('Failed to test email provider:', error);
		throw error;
	}
};
