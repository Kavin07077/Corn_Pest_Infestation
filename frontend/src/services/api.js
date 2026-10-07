import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // System Health
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Dataset Endpoints
  getDatasetStatistics: async () => {
    const res = await apiClient.get('/dataset/statistics');
    return res.data;
  },

  getDatasetPreview: async (params = {}) => {
    const res = await apiClient.get('/dataset/preview', { params });
    return res.data;
  },

  getDatasetColumns: async () => {
    const res = await apiClient.get('/dataset/columns');
    return res.data;
  },

  uploadDataset: async (formData) => {
    const res = await apiClient.post('/dataset/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Preprocessing
  runPreprocessing: async () => {
    const res = await apiClient.post('/preprocess');
    return res.data;
  },

  // Pattern Analysis
  getPestDistribution: async () => {
    const res = await apiClient.get('/analysis/pests');
    return res.data;
  },

  getEnvironmentAnalysis: async () => {
    const res = await apiClient.get('/analysis/environment');
    return res.data;
  },

  getGrowthStageAnalysis: async () => {
    const res = await apiClient.get('/analysis/growth-stage');
    return res.data;
  },

  getSeasonalAnalysis: async () => {
    const res = await apiClient.get('/analysis/seasonal');
    return res.data;
  },

  // ML Models
  trainModels: async (data = {}) => {
    const res = await apiClient.post('/train', data);
    return res.data;
  },

  getModels: async () => {
    const res = await apiClient.get('/models');
    return res.data;
  },

  getModelEvaluation: async () => {
    const res = await apiClient.get('/model/evaluation');
    return res.data;
  },

  getFeatureImportance: async () => {
    const res = await apiClient.get('/feature-importance');
    return res.data;
  },

  // Prediction
  predictPest: async (inputData) => {
    const res = await apiClient.post('/predict', inputData);
    return res.data;
  },

  getPredictionHistory: async (limit = 50) => {
    const res = await apiClient.get('/predictions', { params: { limit } });
    return res.data;
  },

  deletePrediction: async (id) => {
    const res = await apiClient.delete(`/predictions/${id}`);
    return res.data;
  },
};
