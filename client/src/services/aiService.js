import api from './api';

export const aiService = {
  generateProjectSummary: async (projectId) => {
    const response = await api.get(`/ai/project/${projectId}/summary`);
    return response.data;
  }
};
