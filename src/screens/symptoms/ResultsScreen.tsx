import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SymptomStackParamList } from '../../navigation/types';
import { AlertCircle, FileText, PhoneCall, ChevronRight } from 'lucide-react-native';

type Props = {
  navigation: NativeStackNavigationProp<SymptomStackParamList, 'Results'>;
  route: RouteProp<SymptomStackParamList, 'Results'>;
};

export default function ResultsScreen({ navigation, route }: Props) {
  const { result, recordId } = route.params;

  const getUrgencyColor = (level: string) => {
    switch(level) {
      case 'CALL_EMERGENCY': return 'bg-danger';
      case 'GO_TO_HOSPITAL': return 'bg-warning';
      case 'SEE_DOCTOR': return 'bg-primary';
      case 'SELF_CARE': return 'bg-success';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyLabel = (level: string) => {
    return level.replace(/_/g, ' ');
  };

  return (
    <ScrollView className="flex-1 bg-light-surface dark:bg-dark-surface p-4">
      <View className="mt-8 mb-6">
        <Text className="text-2xl font-bold text-text-primary mb-2">Analysis Complete</Text>
      </View>

      <View className={`rounded-2xl p-6 mb-6 ${getUrgencyColor(result.urgency_level)} shadow-lg flex-row items-center`}>
        <AlertCircle color="#fff" size={40} className="mr-4" />
        <View className="flex-1">
          <Text className="text-white text-sm font-bold uppercase tracking-wider mb-1">Recommended Action</Text>
          <Text className="text-white text-2xl font-bold">{getUrgencyLabel(result.urgency_level)}</Text>
        </View>
      </View>

      <View className="bg-white dark:bg-dark-bg rounded-xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-bold text-text-primary mb-2">AI Assessment</Text>
        <Text className="text-text-primary leading-6 mb-4">{result.explanation}</Text>
        
        <Text className="text-lg font-bold text-text-primary mb-2 mt-4">Suggested Steps</Text>
        {result.self_care_steps?.map((step: string, index: number) => (
          <View key={index} className="flex-row items-start mb-3">
            <View className="w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
            <Text className="text-text-primary flex-1 leading-5">{step}</Text>
          </View>
        ))}
      </View>

      <View className="mb-6">
        <TouchableOpacity 
          className="bg-white dark:bg-dark-bg rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
          onPress={() => navigation.navigate('Home' as any)} // For Nearby
        >
          <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
            <PhoneCall color="#1A73E8" size={20} />
          </View>
          <Text className="flex-1 font-semibold text-text-primary">Find Nearby Help</Text>
          <ChevronRight color="#CBD5E1" size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white dark:bg-dark-bg rounded-xl p-4 flex-row items-center shadow-sm"
        >
          <View className="w-10 h-10 bg-success/10 rounded-full items-center justify-center mr-4">
            <FileText color="#2E7D32" size={20} />
          </View>
          <Text className="flex-1 font-semibold text-text-primary">Download PDF Report</Text>
          <ChevronRight color="#CBD5E1" size={24} />
        </TouchableOpacity>
      </View>

      <Text className="text-xs text-text-muted text-center mt-4 mb-8 px-4 leading-5 italic">
        CareAI provides health information for guidance only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
      </Text>

      <TouchableOpacity 
        className="border border-primary p-4 rounded-xl items-center mb-8"
        onPress={() => navigation.getParent()?.navigate('HomeStack', { screen: 'Home' })}
      >
        <Text className="text-primary font-bold">Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
