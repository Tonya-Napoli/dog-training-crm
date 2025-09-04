import axios from '../../axios.js';

export const generateClientGrowthReport = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.period) params.append('period', filters.period);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);
    
    const response = await axios.get(`/reports/client-growth?${params.toString()}`);
    return response.data.report;
  } catch (error) {
    console.error('Report Service Error:', error);
    throw new Error(`Failed to generate client growth report: ${error.response?.data?.message || error.message}`);
  }
};

export const generateSessionMetricsReport = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.period) params.append('period', filters.period);
    
    const response = await axios.get(`/reports/session-metrics?${params.toString()}`);
    return response.data.report;
  } catch (error) {
    console.error('Report Service Error:', error);
    throw new Error(`Failed to generate session metrics report: ${error.response?.data?.message || error.message}`);
  }
};

export const generateRevenueAnalysisReport = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.period) params.append('period', filters.period);
    
    const response = await axios.get(`/reports/revenue-analysis?${params.toString()}`);
    return response.data.report;
  } catch (error) {
    console.error('Report Service Error:', error);
    throw new Error(`Failed to generate revenue analysis report: ${error.response?.data?.message || error.message}`);
  }
};