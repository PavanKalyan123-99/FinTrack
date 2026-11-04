import api from './api';

export const aiService = {
  async getInsights(refresh = false) {
    const response = await api.get('/ai/insights', { params: { refresh } });
    return response.data;
  },

  async askAdvisor(message) {
    const response = await api.post('/ai/ask', { message });
    return response.data;
  },

  async getHealthScore() {
    const response = await api.get('/ai/health-score');
    return response.data;
  },
};
