import api from './api';

export const budgetService = {
  async getBudgets(params = {}) {
    const response = await api.get('/budgets', { params });
    return response.data;
  },

  async createBudget(data) {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  async updateBudget(id, data) {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data;
  },

  async deleteBudget(id) {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};
