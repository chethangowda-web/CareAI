import OpenAI from 'openai';
import { logger } from '../utils/logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are CareAI, a health information assistant.
Classify urgency as: SELF_CARE | SEE_DOCTOR | GO_TO_HOSPITAL | CALL_EMERGENCY.
Never diagnose. Always recommend a professional.
Chest pain / breathing difficulty / loss of consciousness / stroke signs → always CALL_EMERGENCY.
Return ONLY valid JSON matching this exact structure:
{
  "urgency_level": "SELF_CARE" | "SEE_DOCTOR" | "GO_TO_HOSPITAL" | "CALL_EMERGENCY",
  "explanation": "<plain English explanation, max 3 sentences>",
  "self_care_steps": ["<step 1>", "<step 2>", "<step 3>"],
  "escalation_flag": true | false,
  "confidence": "low" | "medium" | "high"
}`;

/**
 * Strips PII-like patterns from symptom text before sending to OpenAI.
 */
function stripPII(text: string): string {
  return text
    .replace(/\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/gi, '[email]')
    .replace(/\b(\+91|0)?[6-9]\d{9}\b/g, '[phone]')
    .replace(/\b\d{12}\b/g, '[id]')
    .trim();
}

export interface AnalysisInput {
  symptoms: string;
  duration: string;
  severity: number;
  temperature?: number;
  temperatureUnit?: string;
}

export interface AnalysisOutput {
  urgency_level: string;
  explanation: string;
  self_care_steps: string[];
  escalation_flag: boolean;
  confidence: 'low' | 'medium' | 'high';
}

export const analyzeSymptoms = async (input: AnalysisInput): Promise<AnalysisOutput> => {
  const cleanSymptoms = stripPII(input.symptoms);
  const tempInfo = input.temperature
    ? `Temperature: ${input.temperature}°${input.temperatureUnit || 'C'}.`
    : 'Temperature: not recorded.';

  const userMessage = `Patient reports: ${cleanSymptoms}.
Duration: ${input.duration}. Severity (1-10): ${input.severity}. ${tempInfo}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
      temperature: 0.2,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from AI');

    const parsed: AnalysisOutput = JSON.parse(raw);

    // Validate required fields
    const validLevels = ['SELF_CARE', 'SEE_DOCTOR', 'GO_TO_HOSPITAL', 'CALL_EMERGENCY'];
    if (!validLevels.includes(parsed.urgency_level)) {
      parsed.urgency_level = 'SEE_DOCTOR';
    }

    return parsed;
  } catch (err) {
    logger.error('OpenAI analysis failed', { error: (err as Error).message });
    // Fail safe — never expose OpenAI errors to the client
    return {
      urgency_level: 'SEE_DOCTOR',
      explanation: 'We could not complete the AI analysis at this time. Please consult a healthcare professional.',
      self_care_steps: ['Rest and monitor your symptoms.', 'Stay hydrated.', 'Seek medical advice if symptoms worsen.'],
      escalation_flag: false,
      confidence: 'low',
    };
  }
};
