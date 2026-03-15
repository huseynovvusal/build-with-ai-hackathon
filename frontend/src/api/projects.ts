import { apiFetch } from './client';

export interface ProjectPayload {
  title: string;
  description: string;
  required_skills: string[];
}

export const projectsApi = {
  listProjects: async () => {
    const res = await apiFetch('/projects/');
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  createProject: async (data: ProjectPayload) => {
    const res = await apiFetch('/projects/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  listProposals: async () => {
    const res = await apiFetch('/proposals/');
    if (!res.ok) throw new Error('Failed to fetch proposals');
    return res.json();
  },

  activateProposal: async (id: number) => {
    const res = await apiFetch(`/proposals/${id}/activate/`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to activate proposal');
    return res.json();
  },
};
