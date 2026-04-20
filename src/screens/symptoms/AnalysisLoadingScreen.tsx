import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SymptomStackParamList } from '../../navigation/types';
import { HeartPulse } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<SymptomStackParamList, 'AnalysisLoading'>;
  route: RouteProp<SymptomStackParamList, 'AnalysisLoading'>;
};

export default function AnalysisLoadingScreen({ navigation, route }: Props) {
  const { symptoms, duration, severity, temperature, temperatureUnit } = route.params;
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const analyzeSymptoms = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/symptoms/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            symptoms,
            duration,
            severity,
            temperature,
            temperatureUnit
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          navigation.replace('Results', { result: data.data, recordId: data.recordId });
        } else {
          throw new Error(data.error || 'Failed to analyze symptoms');
        }
      } catch (error) {
        // Fallback or error handling
        navigation.replace('Results', { 
          result: {
            urgency_level: 'SEE_DOCTOR',
            explanation: 'Self-analysis error. Please consult a doctor for a proper check-up.',
            self_care_steps: ['Rest and monitor your symptoms.'],
            escalation_flag: false
          },
          recordId: 'error'
        });
      }
    };

    analyzeSymptoms();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-light-bg dark:bg-dark-bg p-6">
      <HeartPulse color="#1A73E8" size={80} className="mb-6 animate-pulse" />
      <Text className="text-2xl font-bold text-text-primary mb-2 text-center">Analysing your symptoms...</Text>
      <Text className="text-text-muted text-center">Our AI is cross-referencing your symptoms with medical databases.</Text>
    </View>
  );
}
