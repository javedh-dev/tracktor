interface RequestConfig {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	headers?: Record<string, string>;
	params?: Record<string, any>;
	data?: any;
	timeout?: number;
	baseURL?: string;
}

interface Response<T = any> {
	data: T;
	status: number;
	statusText: string;
	headers: Headers;
	config: RequestConfig;
}

class HttpError extends Error {
	response?: Response;
	request?: RequestConfig;
	status?: number;

	constructor(message: string, config?: RequestConfig, response?: Response) {
		super(message);
		this.name = 'HttpError';
		this.request = config;
		this.response = response;
		this.status = response?.status;
	}
}

class HttpClient {
	private baseURL: string = '';
	private defaultHeaders: Record<string, string> = {
		'Content-Type': 'application/json'
	};
	private timeout: number = 10000;
	private requestInterceptors: ((req: RequestConfig) => void)[] = [];

	constructor(config?: { baseURL?: string; headers?: Record<string, string>; timeout?: number }) {
		if (config?.baseURL) this.baseURL = config.baseURL;
		if (config?.headers) this.defaultHeaders = { ...this.defaultHeaders, ...config.headers };
		if (config?.timeout) this.timeout = config.timeout;
	}

	private buildURL(url: string, params?: Record<string, any>): string {
		const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

		if (!params) return fullURL;

		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, String(value));
			}
		});

		const paramString = searchParams.toString();
		return paramString ? `${fullURL}?${paramString}` : fullURL;
	}

	private async makeRequest<T = any>(
		url: string,
		config: RequestConfig = {}
	): Promise<Response<T>> {
		const {
			method = 'GET',
			headers = {},
			params,
			data,
			timeout = this.timeout,
			baseURL = this.baseURL
		} = config;

		const fullURL = this.buildURL(url, params);
		const mergedHeaders = { ...this.defaultHeaders, ...headers };

		/* global RequestInit */
		const fetchOptions: RequestInit = {
			method,
			headers: mergedHeaders
		};

		if (data && method !== 'GET') {
			if (data instanceof FormData) {
				fetchOptions.body = data;
				// Remove Content-Type to let browser set it with boundary
				delete mergedHeaders['Content-Type'];
			} else if (typeof data === 'object') {
				fetchOptions.body = JSON.stringify(data);
			} else {
				fetchOptions.body = data;
			}
		}

		// Timeout handling
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);
		fetchOptions.signal = controller.signal;

		this.requestInterceptors.forEach((intercept) => intercept(config));
		try {
			const response = await fetch(fullURL, fetchOptions);
			clearTimeout(timeoutId);

			let responseData: T;
			const contentType = response.headers.get('content-type');

			if (contentType?.includes('application/json')) {
				responseData = await response.json();
			} else {
				responseData = (await response.text()) as T;
			}

			const result: Response<T> = {
				data: responseData,
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
				config
			};

			if (!response.ok) {
				throw new HttpError(`Request failed with status ${response.status}`, config, result);
			}

			return result;
		} catch (error: any) {
			clearTimeout(timeoutId);

			if (error instanceof HttpError) {
				throw error;
			}

			if (error.name === 'AbortError') {
				throw new HttpError('Request timeout', config);
			}

			throw new HttpError(error.message || 'Network error', config);
		}
	}

	// Main HTTP methods
	async get<T = any>(
		url: string,
		config?: Omit<RequestConfig, 'method' | 'data'>
	): Promise<Response<T>> {
		return this.makeRequest<T>(url, { ...config, method: 'GET' });
	}

	async post<T = any>(
		url: string,
		data?: any,
		config?: Omit<RequestConfig, 'method' | 'data'>
	): Promise<Response<T>> {
		return this.makeRequest<T>(url, { ...config, method: 'POST', data });
	}

	async put<T = any>(
		url: string,
		data?: any,
		config?: Omit<RequestConfig, 'method' | 'data'>
	): Promise<Response<T>> {
		return this.makeRequest<T>(url, { ...config, method: 'PUT', data });
	}

	async patch<T = any>(
		url: string,
		data?: any,
		config?: Omit<RequestConfig, 'method' | 'data'>
	): Promise<Response<T>> {
		return this.makeRequest<T>(url, { ...config, method: 'PATCH', data });
	}

	async delete<T = any>(
		url: string,
		config?: Omit<RequestConfig, 'method' | 'data'>
	): Promise<Response<T>> {
		return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
	}

	// Axios-like static methods
	static async get<T = any>(url: string, config?: RequestConfig): Promise<Response<T>> {
		const client = new HttpClient();
		return client.get<T>(url, config);
	}

	static async post<T = any>(
		url: string,
		data?: any,
		config?: RequestConfig
	): Promise<Response<T>> {
		const client = new HttpClient();
		return client.post<T>(url, data, config);
	}

	static async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>> {
		const client = new HttpClient();
		return client.put<T>(url, data, config);
	}

	static async patch<T = any>(
		url: string,
		data?: any,
		config?: RequestConfig
	): Promise<Response<T>> {
		const client = new HttpClient();
		return client.patch<T>(url, data, config);
	}

	static async delete<T = any>(url: string, config?: RequestConfig): Promise<Response<T>> {
		const client = new HttpClient();
		return client.delete<T>(url, config);
	}

	addRequestInterceptor = (interceptor: (req: RequestConfig) => void) => {
		this.requestInterceptors.push(interceptor);
	};

	// Interceptors (simplified version)
	setDefaultHeader(key: string, value: string): void {
		this.defaultHeaders[key] = value;
	}

	removeDefaultHeader(key: string): void {
		delete this.defaultHeaders[key];
	}

	setBaseURL(baseURL: string): void {
		this.baseURL = baseURL;
	}

	setTimeout(timeout: number): void {
		this.timeout = timeout;
	}
}

// Create default instance
const http = new HttpClient();

// Export both the class and default instance
export { HttpClient, HttpError, type RequestConfig, type Response };
export default http;
