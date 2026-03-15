import { apiFetch } from './client';

export const membersApi = {
  list: async () => {
    const res = await apiFetch('/members/');
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
  },
};
