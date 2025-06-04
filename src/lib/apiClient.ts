
import { API_BASE_URL } from '@/config';

type ApiClientOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  token?: string | null;
};

async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, token: optionToken } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Prefer token from options if provided, otherwise try localStorage
  const currentToken = optionToken ?? (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      errorData = { message: response.statusText };
    }
    // Include status code in the error object for better handling
    const error = new Error(errorData.message || `API Error: ${response.status}`) as any;
    error.status = response.status;
    error.data = errorData; // Attach full error response data
    throw error;
  }

  // Handle cases where response might be empty (e.g., 204 No Content)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  // For non-JSON responses or empty responses, resolve with null or an appropriate value.
  // This assumes that if it's not JSON and it's OK, it might be an empty successful response.
  return null as unknown as Promise<T>; 
}

export default apiClient;
