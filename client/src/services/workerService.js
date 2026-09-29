import api from './api';

export const workerService = {
  getWorkers: async () => {
    const res = await api.get('/users/workers');
    return res.data;
  },

  getWorkerById: async (id) => {
    const res = await api.get(`/users/workers/${id}`);
    return res.data;
  },

  createWorker: async (workerData) => {
    const res = await api.post('/users/workers', workerData);
    return res.data;
  }
};
