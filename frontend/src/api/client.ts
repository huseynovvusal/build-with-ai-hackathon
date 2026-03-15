export const API_BASE_URL = 'http://localhost:8000/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token_access');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Basic auto-logout on 401
    localStorage.removeItem('token_access');
    localStorage.removeItem('token_refresh');
    window.dispatchEvent(new Event('unauthorized'));
  }

  return response;
}
