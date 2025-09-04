// src/services/ReportService.js
import { apiRequest } from '../utils/apiUtils';

export const generateClientGrowthReport = async (dateRange = null) => {
  try {
    const params = dateRange ? { dateRange } : {};
    const response = await apiRequest('/api/reports/client-growth', {
      method: 'GET',
      params
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to generate client growth report: ${error.message}`);
  }
};