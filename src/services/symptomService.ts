import api from './api';
import { SymptomInput, AIAnalysisResult, HealthRecord } from '../types/symptom.types';

export const analyzeSymptoms = async (input: SymptomInput): Promise<{ data: AIAnalysisResult; recordId: string }> => {
  const { data } = await api.post('/symptoms/analyze', input);
  return data;
};

export const getHistory = async (): Promise<HealthRecord[]> => {
  const { data } = await api.get('/history');
  return data.records;
};

export const getRecord = async (id: string): Promise<HealthRecord> => {
  const { data } = await api.get(`/history/${id}`);
  return data.record;
};
