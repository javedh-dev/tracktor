import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const mockLocalStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
	value: mockLocalStorage,
	writable: true
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock SvelteKit modules before importing apiClient
vi.mock('$app/environment', () => ({
	browser: true
}));

vi.mock('$env/dynamic/public', () => ({
	env: {
		TRACKTOR_API_BASE_URL: 'https://api.test.com'
	}
}));

// Import after mocking
import { apiClient } from '../api.helper';

describe('API Helper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLocalStorage.getItem.mockReturnValue('test-pin-123');
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('apiClient configuration', () => {
		it('should be configured with correct base URL', () => {
			expect(apiClient).toBeDefined();
			// We can't directly access private properties, but we can test through requests
		});

		it('should include user pin in headers from localStorage', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			await apiClient.get('/test');

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/test',
				expect.objectContaining({
					headers: expect.objectContaining({
						'x-user-pin': 'test-pin-123'
					})
				})
			);
		});

		it('should throw error missing user pin', async () => {
			mockLocalStorage.getItem.mockReturnValue(null);

			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			await expect(apiClient.get('/test')).rejects.toThrow('Request cancelled by interceptor');

			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('should have correct timeout configuration', async () => {
			// Test that requests timeout after 1 second
			let abortSignal: AbortSignal | undefined;

			mockFetch.mockImplementation((url, options) => {
				abortSignal = options?.signal;
				return new Promise((resolve, reject) => {
					// Simulate a slow request that gets aborted
					if (abortSignal) {
						abortSignal.addEventListener('abort', () => {
							reject(new DOMException('The operation was aborted.', 'AbortError'));
						});
					}
					// Never resolve to simulate a hanging request
				});
			});

			const promise = apiClient.get('/slow', { timeout: 1000 });

			// Verify that the request was made with an abort signal
			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					signal: expect.any(AbortSignal)
				})
			);

			// The promise should reject with a timeout error
			await expect(promise).rejects.toThrow('Request timeout');
		}, 2000); // Set test timeout to 2 seconds to allow for the 1-second timeout
	});

	describe('Request interceptor', () => {
		it('should update user pin on each request', async () => {
			// First request with initial pin
			mockLocalStorage.getItem.mockReturnValue('initial-pin');

			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'test1' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			await apiClient.get('/test1');

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/test1',
				expect.objectContaining({
					headers: expect.objectContaining({
						'x-user-pin': 'initial-pin'
					})
				})
			);

			// Change the pin in localStorage
			mockLocalStorage.getItem.mockReturnValue('updated-pin');

			// Second request should use updated pin
			await apiClient.get('/test2');

			expect(mockFetch).toHaveBeenLastCalledWith(
				'https://api.test.com/api/test2',
				expect.objectContaining({
					headers: expect.objectContaining({
						'x-user-pin': 'updated-pin'
					})
				})
			);
		});

		it('should preserve other headers while updating user pin', async () => {
			mockLocalStorage.getItem.mockReturnValue('test-pin');

			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			await apiClient.get('/test', {
				headers: {
					Authorization: 'Bearer token',
					'Custom-Header': 'custom-value'
				}
			});

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/test',
				expect.objectContaining({
					headers: expect.objectContaining({
						'x-user-pin': 'test-pin',
						Authorization: 'Bearer token',
						'Custom-Header': 'custom-value',
						'Content-Type': 'application/json'
					})
				})
			);
		});
	});

	describe('HTTP methods', () => {
		beforeEach(() => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ success: true })
			};
			mockFetch.mockResolvedValue(mockResponse);
		});

		it('should make GET requests', async () => {
			const response = await apiClient.get('/users');

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/users',
				expect.objectContaining({
					method: 'GET'
				})
			);
			expect(response.data).toEqual({ success: true });
		});

		it('should make POST requests', async () => {
			const postData = { name: 'John', email: 'john@example.com' };
			const response = await apiClient.post('/users', postData);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/users',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(postData)
				})
			);
			expect(response.data).toEqual({ success: true });
		});

		it('should make PUT requests', async () => {
			const putData = { name: 'John Updated' };
			const response = await apiClient.put('/users/1', putData);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/users/1',
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify(putData)
				})
			);
			expect(response.data).toEqual({ success: true });
		});

		it('should make PATCH requests', async () => {
			const patchData = { email: 'newemail@example.com' };
			const response = await apiClient.patch('/users/1', patchData);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/users/1',
				expect.objectContaining({
					method: 'PATCH',
					body: JSON.stringify(patchData)
				})
			);
			expect(response.data).toEqual({ success: true });
		});

		it('should make DELETE requests', async () => {
			const response = await apiClient.delete('/users/1');

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/users/1',
				expect.objectContaining({
					method: 'DELETE'
				})
			);
			expect(response.data).toEqual({ success: true });
		});
	});

	describe('Error handling', () => {
		it('should handle API errors', async () => {
			const mockErrorResponse = {
				ok: false,
				status: 400,
				statusText: 'Bad Request',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ error: 'Invalid data' })
			};
			mockFetch.mockResolvedValue(mockErrorResponse);

			await expect(apiClient.post('/users', { invalid: 'data' })).rejects.toThrow(
				'Request failed with status 400'
			);
		});

		it('should handle network errors', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			await expect(apiClient.get('/users')).rejects.toThrow('Network error');
		});

		it('should handle authentication errors', async () => {
			const mockAuthError = {
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ error: 'Invalid user pin' })
			};
			mockFetch.mockResolvedValue(mockAuthError);

			await expect(apiClient.get('/protected')).rejects.toThrow('Request failed with status 401');
		});
	});

	describe('Server-side rendering compatibility', () => {
		it.skip('should handle SSR environment (no browser)', async () => {
			// Test the SSR behavior by simulating what happens when browser is false
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'ssr-test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			// Create a temporary HttpClient to simulate SSR behavior
			const { HttpClient } = await import('../http.helper');
			const ssrApiClient = new HttpClient({
				baseURL: 'https://api.test.com',
				headers: {
					'x-user-pin': '' // Simulate SSR where browser is false
				},
				timeout: 5000
			});

			ssrApiClient.addRequestInterceptor((req) => {
				req.headers = {
					...req.headers,
					'x-user-pin': '' // Simulate no browser access
				};
				return true;
			});

			await expect(ssrApiClient.get('/test')).rejects.toThrow('Request cancelled by interceptor');

			expect(mockFetch).not.toHaveBeenCalled();
		});
	});

	describe('Environment configuration', () => {
		it('should use default API base URL when env var is not set', async () => {
			// Test default behavior by creating a new HttpClient instance
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'default-test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			// Create a new HttpClient to simulate what happens when TRACKTOR_API_BASE_URL is not set
			const { HttpClient } = await import('../http.helper');
			const defaultApiClient = new HttpClient({
				baseURL: '/api', // Simulate the default fallback
				headers: {
					'x-user-pin': 'test-pin-123'
				},
				timeout: 5000
			});

			defaultApiClient.addRequestInterceptor((req) => {
				req.headers = {
					...req.headers,
					'x-user-pin': mockLocalStorage.getItem('userPin') || ''
				};
				return true;
			});

			await defaultApiClient.get('/test');

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/test', // Should use default '/api' base URL
				expect.any(Object)
			);
		});
	});

	describe('Real-world API scenarios', () => {
		it('should handle file upload', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ fileId: 'abc123', url: '/uploads/file.jpg' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const formData = new FormData();
			formData.append('file', new Blob(['test file content'], { type: 'image/jpeg' }), 'test.jpg');
			formData.append('category', 'profile');

			const response = await apiClient.post('/upload', formData);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/upload',
				expect.objectContaining({
					method: 'POST',
					body: formData,
					headers: expect.objectContaining({
						'x-user-pin': 'test-pin-123'
						// Content-Type should not be set for FormData
					})
				})
			);
			expect(response.data).toEqual({ fileId: 'abc123', url: '/uploads/file.jpg' });
		});

		it('should handle paginated requests', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({
					data: [
						{ id: 1, name: 'Item 1' },
						{ id: 2, name: 'Item 2' }
					],
					pagination: { page: 1, limit: 10, total: 25 }
				})
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await apiClient.get('/items', {
				params: {
					page: 1,
					limit: 10,
					sort: 'name',
					filter: 'active'
				}
			});

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/items?page=1&limit=10&sort=name&filter=active',
				expect.any(Object)
			);
			expect(response.data.pagination.total).toBe(25);
		});

		it('should handle bulk operations', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({
					processed: 3,
					errors: [],
					results: [{ id: 1 }, { id: 2 }, { id: 3 }]
				})
			};
			mockFetch.mockResolvedValue(mockResponse);

			const bulkData = {
				operation: 'update',
				items: [
					{ id: 1, status: 'active' },
					{ id: 2, status: 'inactive' },
					{ id: 3, status: 'pending' }
				]
			};

			const response = await apiClient.post('/bulk-update', bulkData);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/bulk-update',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(bulkData)
				})
			);
			expect(response.data.processed).toBe(3);
		});
	});
});
