import env from '../config/env';
import { getCookie } from '../utils/cookie';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${env.API_BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers);
    const token = getCookie('syncstream-token') || localStorage.getItem('syncstream-token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    console.log(`[HTTP Request] ${options.method || 'GET'} ${url}`);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
      });
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      console.error(`[CORS / Network Error] ${msg}`);
      throw new Error(`Server network or CORS error (${url}). Please ensure backend CORS headers allow requests from http://localhost:5173.`);
    }

    if (!response.ok) {
      let errorMessage = `API error (${response.status}): ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
        else if (errorData.error) errorMessage = errorData.error;
      } catch (e) {
        // failed to parse json error
      }
      console.error(`[HTTP Error] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) return {} as T;
    try {
      return JSON.parse(text);
    } catch {
      return {} as T;
    }
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T, TBody = unknown>(endpoint: string, body: TBody, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
