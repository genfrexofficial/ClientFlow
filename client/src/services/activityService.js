import api from './api';

export const activityService = {
  getProjectActivities: async (projectId) => {
    const response = await api.get(`/activities/project/${projectId}`);
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/activities/recent');
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get('/activities/audit', { params });
    return response.data;
  }
};
