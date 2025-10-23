import { API_URL } from '../../constants/api';
import { getToken } from './token';

type RequestOptions = RequestInit & { timeoutMs?: number };

async function fetchWithTimeout(url: string, options: RequestOptions = {}) {
  const { timeoutMs = 15000, ...rest } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...rest, signal: controller.signal } as RequestInit);
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function authHeaders() {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T = any>(path: string, opts: RequestOptions = {}) {
  const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = await authHeaders();
  const merged: RequestInit = {
    ...opts,
    headers: {
      ...headers,
      ...(opts.headers || {}),
    },
  };

  const res = await fetchWithTimeout(url, merged);

  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    const body = isJson ? JSON.parse(text || '{}') : text;
    const err: any = new Error(body?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }

  if (text === '') return null as unknown as T;
  return (isJson ? JSON.parse(text) : text) as T;
}

export const api = {
  get: <T = any>(path: string, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T = any>(path: string, body?: any, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(path: string, body?: any, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T = any>(path: string, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};

export default api;
