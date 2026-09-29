import api from './api';

export const hrService = {
  // Candidates
  getCandidates: async (params = {}) => {
    const res = await api.get('/hr/candidates', { params });
    return res.data;
  },

  getCandidateById: async (id) => {
    const res = await api.get(`/hr/candidates/${id}`);
    return res.data;
  },

  createCandidate: async (data) => {
    const res = await api.post('/hr/candidates', data);
    return res.data;
  },

  updateCandidate: async (id, data) => {
    const res = await api.put(`/hr/candidates/${id}`, data);
    return res.data;
  },

  deleteCandidate: async (id) => {
    const res = await api.delete(`/hr/candidates/${id}`);
    return res.data;
  },

  // Appointments
  getAppointments: async (params = {}) => {
    const res = await api.get('/hr/appointments', { params });
    return res.data;
  },

  getAppointmentById: async (id) => {
    const res = await api.get(`/hr/appointments/${id}`);
    return res.data;
  },

  createAppointment: async (data) => {
    const res = await api.post('/hr/appointments', data);
    return res.data;
  },

  updateAppointment: async (id, data) => {
    const res = await api.put(`/hr/appointments/${id}`, data);
    return res.data;
  },

  submitForApproval: async (id, comment = '') => {
    const res = await api.post(`/hr/appointments/${id}/submit`, { comment });
    return res.data;
  },

  approveAppointment: async (id, comment = '') => {
    const res = await api.post(`/hr/appointments/${id}/approve`, { comment });
    return res.data;
  },

  rejectAppointment: async (id, reason) => {
    const res = await api.post(`/hr/appointments/${id}/reject`, { reason });
    return res.data;
  },

  generatePDF: async (id) => {
    const res = await api.post(`/hr/appointments/${id}/generate-pdf`);
    return res.data;
  },

  sendAppointment: async (id, confirmResend = false) => {
    const res = await api.post(`/hr/appointments/${id}/send`, { confirmResend });
    return res.data;
  },

  updateAcceptanceStatus: async (id, status, reason = '') => {
    const res = await api.put(`/hr/appointments/${id}/acceptance`, { status, reason });
    return res.data;
  },

  deleteAppointment: async (id) => {
    const res = await api.delete(`/hr/appointments/${id}`);
    return res.data;
  },

  // Analytics, Reports & Audit
  getHRStats: async () => {
    const res = await api.get('/hr/stats');
    return res.data;
  },

  getHRReports: async () => {
    const res = await api.get('/hr/reports');
    return res.data;
  },

  getHRAuditLogs: async (params = {}) => {
    const res = await api.get('/hr/audit-logs', { params });
    return res.data;
  },

  // Settings
  getHRSettings: async () => {
    const res = await api.get('/hr/settings');
    return res.data;
  },

  updateHRSettings: async (data) => {
    const res = await api.put('/hr/settings', data);
    return res.data;
  },

  updateTemplate: async (data) => {
    const res = await api.put('/hr/template', data);
    return res.data;
  }
};
