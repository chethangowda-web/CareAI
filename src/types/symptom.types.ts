export type UrgencyLevel = 'SELF_CARE' | 'SEE_DOCTOR' | 'GO_TO_HOSPITAL' | 'CALL_EMERGENCY';

export interface SymptomInput {
  symptoms: string;
  duration: 'hours' | 'days' | 'weeks';
  severity: number; // 1-10
  temperature?: number;
  temperatureUnit: 'C' | 'F';
  preExistingConditions?: string[];
}

export interface AIAnalysisResult {
  urgency_level: UrgencyLevel;
  explanation: string;
  self_care_steps: string[];
  escalation_flag: boolean;
  confidence: 'low' | 'medium' | 'high';
}

export interface HealthRecord {
  id: string;
  user_id: string;
  symptoms: string;
  severity: number;
  temperature?: number;
  urgency_level: UrgencyLevel;
  ai_explanation: string;
  self_care_steps: string[];
  escalation_flag: boolean;
  created_at: string;
}
