import { create } from 'zustand';
import { HealthRecord } from '../types/symptom.types';

interface HistoryStore {
  records: HealthRecord[];
  setRecords: (records: HealthRecord[]) => void;
  addRecord: (record: HealthRecord) => void;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  records: [],
  setRecords: (records) => set({ records }),
  addRecord: (record) => set((s) => ({ records: [record, ...s.records] })),
}));
