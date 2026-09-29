import api from './api';

export const taskRequestService = {
  getTaskRequests: async (params = {}) => {
    const res = await api.get('/task-requests', { params });
    return res.data;
  },

  getTaskRequestById: async (id) => {
    const res = await api.get(`/task-requests/${id}`);
    return res.data;
  },

  createTaskRequest: async (data) => {
    const res = await api.post('/task-requests', data);
    return res.data;
  },

  approveTaskRequest: async (id, data) => {
    const res = await api.post(`/task-requests/${id}/approve`, data);
    return res.data;
  },

  rejectTaskRequest: async (id, data) => {
    const res = await api.post(`/task-requests/${id}/reject`, data);
    return res.data;
  }
};
