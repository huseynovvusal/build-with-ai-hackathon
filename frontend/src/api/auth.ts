import { apiFetch } from './client';

export interface AuthResponse {
  access: string;
  refresh: string;
  member: any;
}

export const authApi = {
  exchangeGitHubCode: async (code: string): Promise<AuthResponse> => {
    const res = await apiFetch('/auth/github/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to authenticate');
    }
    return res.json();
  },

  getMe: async () => {
    const res = await apiFetch('/auth/me/');
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },
};
