import api from './api';

export const analyticsService = {
  async getSummary() {
    const response = await api.get('/analytics/summary');
    return response.data;
  },

  async getMonthlyTrends(months = 6) {
    const response = await api.get('/analytics/monthly', { params: { months } });
    return response.data;
  },

  async getCategoryBreakdown(period = 'month') {
    const response = await api.get('/analytics/categories', { params: { period } });
    return response.data;
  },

  async getWeeklySpending() {
    const response = await api.get('/analytics/weekly');
    return response.data;
  },
};
