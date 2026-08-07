/* global BodyInit */

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
  responseType?: 'json' | 'blob';
}

interface Response<T = any> {
  data: T;
  status: number;
}

class HttpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly response?: Response
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

class HttpClient {
  constructor(
    private config: { baseURL?: string; headers?: Record<string, string>; timeout?: number } = {}
  ) {}

  private async request<T>(url: string, config: RequestConfig): Promise<Response<T>> {
    const isFormData = config.data instanceof FormData;
    const headers: Record<string, string> = {
      // FormData sets its own Content-Type so it carries the multipart boundary.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...this.config.headers,
      ...config.headers
    };
    let body: BodyInit | undefined;

    if (config.data !== undefined && config.method !== 'GET') {
      body =
        isFormData || typeof config.data !== 'object' ? config.data : JSON.stringify(config.data);
    }

    let response: globalThis.Response;
    try {
      response = await fetch(url.startsWith('http') ? url : `${this.config.baseURL ?? ''}${url}`, {
        method: config.method,
        headers,
        body,
        signal: AbortSignal.timeout(config.timeout ?? this.config.timeout ?? 10000)
      });
    } catch (error: any) {
      throw new HttpError(error?.name === 'TimeoutError' ? 'Request timeout' : 'Network error');
    }

    const contentType = response.headers.get('content-type');
    const data = (
      config.responseType === 'blob'
        ? await response.blob()
        : contentType?.includes('application/json')
          ? await response.json()
          : await response.text()
    ) as T;

    const result = { data, status: response.status };
    if (!response.ok) {
      throw new HttpError(`Request failed with status ${response.status}`, response.status, result);
    }
    return result;
  }

  get<T = any>(url: string, config: RequestConfig = {}) {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  post<T = any>(url: string, data?: any, config: RequestConfig = {}) {
    return this.request<T>(url, { ...config, method: 'POST', data });
  }

  put<T = any>(url: string, data?: any, config: RequestConfig = {}) {
    return this.request<T>(url, { ...config, method: 'PUT', data });
  }

  patch<T = any>(url: string, data?: any, config: RequestConfig = {}) {
    return this.request<T>(url, { ...config, method: 'PATCH', data });
  }

  delete<T = any>(url: string, config: RequestConfig = {}) {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export { HttpClient, HttpError, type RequestConfig, type Response };
