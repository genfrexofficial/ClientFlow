import api from './api';

export const commentService = {
  getProjectComments: async (projectId, fileId = null) => {
    const url = fileId
      ? `/comments/project/${projectId}?fileId=${fileId}`
      : `/comments/project/${projectId}`;
    const response = await api.get(url);
    return response.data;
  },

  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  }
};
