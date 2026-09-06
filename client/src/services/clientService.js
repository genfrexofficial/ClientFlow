import api from './api';

export const clientService = {
  getClients: async () => {
    const response = await api.get('/users/clients');
    return response.data;
  },

  getClientById: async (id) => {
    const response = await api.get(`/users/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await api.post('/users/clients', clientData);
    return response.data;
  }
};
