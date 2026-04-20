import { NavigatorScreenParams } from '@react-navigation/native';
import { Place } from '../types/places.types';
import { HealthRecord } from '../types/symptom.types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTP: { phone: string; verificationId: string };
};

export type MainTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  SymptomStack: NavigatorScreenParams<SymptomStackParamList>;
  Nearby: undefined;
  Emergency: undefined;
  History: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type SymptomStackParamList = {
  SymptomInput: undefined;
  Severity: { symptoms: string; duration: 'hours' | 'days' | 'weeks' };
  AnalysisLoading: { symptoms: string; duration: 'hours' | 'days' | 'weeks'; severity: number; temperature: number; temperatureUnit: 'C' | 'F' };
  Results: { result: any, recordId: string };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
