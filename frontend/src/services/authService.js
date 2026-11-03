import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
      localStorage.setItem('fintrack_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
      localStorage.setItem('fintrack_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updatePassword(data) {
    const response = await api.put('/auth/update-password', data);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('fintrack_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('fintrack_token');
  },
};
