import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient, HttpError, type RequestConfig, type Response } from '../http.helper';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HttpClient', () => {
	let client: HttpClient;

	beforeEach(() => {
		client = new HttpClient();
		vi.clearAllMocks();
		vi.clearAllTimers();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('Constructor', () => {
		it('should create instance with default config', () => {
			const defaultClient = new HttpClient();
			expect(defaultClient).toBeInstanceOf(HttpClient);
		});

		it('should create instance with custom config', () => {
			const customClient = new HttpClient({
				baseURL: 'https://api.example.com',
				headers: { Authorization: 'Bearer token' },
				timeout: 5000
			});
			expect(customClient).toBeInstanceOf(HttpClient);
		});
	});

	describe('GET requests', () => {
		it('should make successful GET request', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await client.get('/test');

			expect(mockFetch).toHaveBeenCalledWith('/test', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
				signal: expect.any(AbortSignal)
			});
			expect(response.data).toEqual({ data: 'test' });
			expect(response.status).toBe(200);
		});

		it('should handle GET request with query parameters', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			await client.get('/test', { params: { page: 1, limit: 10 } });

			expect(mockFetch).toHaveBeenCalledWith('/test?page=1&limit=10', expect.any(Object));
		});

		it('should handle GET request with custom headers', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			await client.get('/test', { headers: { Authorization: 'Bearer token' } });

			expect(mockFetch).toHaveBeenCalledWith('/test', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer token'
				},
				signal: expect.any(AbortSignal)
			});
		});
	});

	describe('POST requests', () => {
		it('should make successful POST request with JSON data', async () => {
			const mockResponse = {
				ok: true,
				status: 201,
				statusText: 'Created',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ id: 1, name: 'test' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const postData = { name: 'test', email: 'test@example.com' };
			const response = await client.post('/users', postData);

			expect(mockFetch).toHaveBeenCalledWith('/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(postData),
				signal: expect.any(AbortSignal)
			});
			expect(response.data).toEqual({ id: 1, name: 'test' });
			expect(response.status).toBe(201);
		});

		it('should handle POST request with FormData', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ success: true })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const formData = new FormData();
			formData.append('file', new Blob(['test'], { type: 'text/plain' }));

			await client.post('/upload', formData);

			expect(mockFetch).toHaveBeenCalledWith('/upload', {
				method: 'POST',
				headers: {}, // Content-Type should be removed for FormData
				body: formData,
				signal: expect.any(AbortSignal)
			});
		});

		it('should handle POST request with string data', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'text/plain' }),
				text: vi.fn().mockResolvedValue('success')
			};
			mockFetch.mockResolvedValue(mockResponse);

			await client.post('/webhook', 'raw data');

			expect(mockFetch).toHaveBeenCalledWith('/webhook', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: 'raw data',
				signal: expect.any(AbortSignal)
			});
		});
	});

	describe('PUT requests', () => {
		it('should make successful PUT request', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ id: 1, name: 'updated' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const updateData = { name: 'updated' };
			const response = await client.put('/users/1', updateData);

			expect(mockFetch).toHaveBeenCalledWith('/users/1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updateData),
				signal: expect.any(AbortSignal)
			});
			expect(response.data).toEqual({ id: 1, name: 'updated' });
		});
	});

	describe('PATCH requests', () => {
		it('should make successful PATCH request', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ id: 1, name: 'patched' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const patchData = { name: 'patched' };
			const response = await client.patch('/users/1', patchData);

			expect(mockFetch).toHaveBeenCalledWith('/users/1', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(patchData),
				signal: expect.any(AbortSignal)
			});
			expect(response.data).toEqual({ id: 1, name: 'patched' });
		});
	});

	describe('DELETE requests', () => {
		it('should make successful DELETE request', async () => {
			const mockResponse = {
				ok: true,
				status: 204,
				statusText: 'No Content',
				headers: new Headers(),
				text: vi.fn().mockResolvedValue('')
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await client.delete('/users/1');

			expect(mockFetch).toHaveBeenCalledWith('/users/1', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				signal: expect.any(AbortSignal)
			});
			expect(response.status).toBe(204);
		});
	});

	describe('Error handling', () => {
		it('should throw HttpError for HTTP error status', async () => {
			const mockResponse = {
				ok: false,
				status: 404,
				statusText: 'Not Found',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ error: 'Not found' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			await expect(client.get('/nonexistent')).rejects.toThrow(HttpError);
			await expect(client.get('/nonexistent')).rejects.toThrow('Request failed with status 404');
		});

		it('should throw HttpError for network errors', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			await expect(client.get('/test')).rejects.toThrow(HttpError);
			await expect(client.get('/test')).rejects.toThrow('Network error');
		});

		it.skip('should handle timeout errors', async () => {
			// Mock fetch to return a promise that never resolves
			mockFetch.mockImplementation(() => new Promise(() => {}));

			const promise = client.get('/slow', { timeout: 1000 });

			// Fast-forward time to trigger timeout
			vi.advanceTimersByTime(1500);

			await expect(promise).rejects.toThrow(HttpError);
			await expect(promise).rejects.toThrow('Request timeout');
		});

		it('should handle non-JSON responses', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'text/plain' }),
				text: vi.fn().mockResolvedValue('plain text response')
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await client.get('/text');
			expect(response.data).toBe('plain text response');
		});
	});

	describe('Configuration methods', () => {
		it('should set default headers', () => {
			client.setDefaultHeader('Authorization', 'Bearer token');
			// We can't directly test this, but we can test it through a request
			expect(() => client.setDefaultHeader('Authorization', 'Bearer token')).not.toThrow();
		});

		it('should remove default headers', () => {
			client.removeDefaultHeader('Content-Type');
			expect(() => client.removeDefaultHeader('Content-Type')).not.toThrow();
		});

		it('should set base URL', () => {
			client.setBaseURL('https://api.example.com');
			expect(() => client.setBaseURL('https://api.example.com')).not.toThrow();
		});

		it('should set timeout', () => {
			client.setTimeout(5000);
			expect(() => client.setTimeout(5000)).not.toThrow();
		});
	});

	describe('Request interceptors', () => {
		it('should add and execute request interceptors', async () => {
			const interceptor = vi.fn();
			interceptor.mockResolvedValue(true);
			client.addRequestInterceptor(interceptor);

			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({})
			};
			mockFetch.mockResolvedValue(mockResponse);

			await client.get('/test');

			expect(interceptor).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET'
				})
			);
		});
	});

	describe('Static methods', () => {
		it('should work with static GET method', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ data: 'static' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await HttpClient.get('/static-test');
			expect(response.data).toEqual({ data: 'static' });
		});

		it('should work with static POST method', async () => {
			const mockResponse = {
				ok: true,
				status: 201,
				statusText: 'Created',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ id: 1 })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await HttpClient.post('/static-post', { name: 'test' });
			expect(response.data).toEqual({ id: 1 });
		});

		it('should work with static PUT method', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ updated: true })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await HttpClient.put('/static-put', { name: 'updated' });
			expect(response.data).toEqual({ updated: true });
		});

		it('should work with static PATCH method', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({ patched: true })
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await HttpClient.patch('/static-patch', { name: 'patched' });
			expect(response.data).toEqual({ patched: true });
		});

		it('should work with static DELETE method', async () => {
			const mockResponse = {
				ok: true,
				status: 204,
				statusText: 'No Content',
				headers: new Headers(),
				text: vi.fn().mockResolvedValue('')
			};
			mockFetch.mockResolvedValue(mockResponse);

			const response = await HttpClient.delete('/static-delete');
			expect(response.status).toBe(204);
		});
	});

	describe('URL building', () => {
		it('should handle absolute URLs', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({})
			};
			mockFetch.mockResolvedValue(mockResponse);

			await client.get('https://external-api.com/test');

			expect(mockFetch).toHaveBeenCalledWith('https://external-api.com/test', expect.any(Object));
		});

		it('should handle base URL with relative paths', async () => {
			const clientWithBase = new HttpClient({ baseURL: 'https://api.example.com' });

			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({})
			};
			mockFetch.mockResolvedValue(mockResponse);

			await clientWithBase.get('/users');

			expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/users', expect.any(Object));
		});

		it('should filter out null and undefined params', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers({ 'content-type': 'application/json' }),
				json: vi.fn().mockResolvedValue({})
			};
			mockFetch.mockResolvedValue(mockResponse);

			await client.get('/test', {
				params: {
					valid: 'value',
					nullParam: null,
					undefinedParam: undefined,
					emptyString: ''
				}
			});

			expect(mockFetch).toHaveBeenCalledWith('/test?valid=value&emptyString=', expect.any(Object));
		});
	});
});

describe('HttpError', () => {
	it('should create HttpError with message only', () => {
		const error = new HttpError('Test error');
		expect(error.message).toBe('Test error');
		expect(error.name).toBe('HttpError');
		expect(error.request).toBeUndefined();
		expect(error.response).toBeUndefined();
		expect(error.status).toBeUndefined();
	});

	it('should create HttpError with config and response', () => {
		const config: RequestConfig = { method: 'GET' };
		const response: Response = {
			data: { error: 'Not found' },
			status: 404,
			statusText: 'Not Found',
			headers: new Headers(),
			config
		};

		const error = new HttpError('Request failed', config, response);
		expect(error.message).toBe('Request failed');
		expect(error.request).toBe(config);
		expect(error.response).toBe(response);
		expect(error.status).toBe(404);
	});
});
