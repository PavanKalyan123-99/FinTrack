import api from './api';

export const reportService = {
  async getMonthlyReport(month, year) {
    const response = await api.get('/reports/monthly', { params: { month, year } });
    return response.data;
  },

  async downloadCSV(filters = {}) {
    const response = await api.get('/reports/export', {
      params: filters,
      responseType: 'blob',
    });

    // Create a blob URL and trigger instant browser download
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinTrack_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
