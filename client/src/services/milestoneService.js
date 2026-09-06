import api from './api';

export const milestoneService = {
  getProjectMilestones: async (projectId) => {
    const response = await api.get(`/milestones/project/${projectId}`);
    return response.data;
  },

  createMilestone: async (milestoneData) => {
    const response = await api.post('/milestones', milestoneData);
    return response.data;
  },

  updateMilestone: async (id, milestoneData) => {
    const response = await api.put(`/milestones/${id}`, milestoneData);
    return response.data;
  },

  deleteMilestone: async (id) => {
    const response = await api.delete(`/milestones/${id}`);
    return response.data;
  }
};
