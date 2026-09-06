import api from './api';

export const fileService = {
  getProjectFiles: async (projectId) => {
    const response = await api.get(`/files/project/${projectId}`);
    return response.data;
  },

  uploadFile: async (formData) => {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteFile: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  reviewDeliverable: async (id, status, reason = '') => {
    const response = await api.put(`/files/${id}/review`, { status, reason });
    return response.data;
  }
};
