import { create } from 'zustand';
import { SymptomInput, AIAnalysisResult } from '../types/symptom.types';

interface SymptomStore {
  input: Partial<SymptomInput>;
  result: AIAnalysisResult | null;
  setInput: (input: Partial<SymptomInput>) => void;
  setResult: (result: AIAnalysisResult) => void;
  reset: () => void;
}

export const useSymptomStore = create<SymptomStore>((set) => ({
  input: {},
  result: null,
  setInput: (input) => set((s) => ({ input: { ...s.input, ...input } })),
  setResult: (result) => set({ result }),
  reset: () => set({ input: {}, result: null }),
}));
