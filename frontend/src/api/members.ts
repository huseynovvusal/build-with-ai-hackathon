import { apiFetch } from './client';

export const membersApi = {
  list: async () => {
    const res = await apiFetch('/members/');
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
  },

  syncOrganization: async (orgName: string) => {
    const res = await apiFetch('/sync/', {
      method: 'POST',
      body: JSON.stringify({ org_name: orgName }),
    });
    if (!res.ok) {
      let message = 'Failed to sync organization members';
      try {
        const err = await res.json();
        if (Array.isArray(err?.logs) && err.logs.length > 0) {
          message = err.logs[err.logs.length - 1];
        } else if (err?.message) {
          message = err.message;
        }
      } catch (_e) {
        // ignore parse errors
      }
      throw new Error(message);
    }
    return res.json();
  },
};
