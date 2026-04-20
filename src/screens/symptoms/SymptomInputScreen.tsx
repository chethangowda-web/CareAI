import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SymptomStackParamList } from '../../navigation/types';
import { Mic, MicOff } from 'lucide-react-native';
import { COMMON_SYMPTOMS } from '../../constants/symptoms';

type Props = {
  navigation: NativeStackNavigationProp<SymptomStackParamList, 'SymptomInput'>;
};

export default function SymptomInputScreen({ navigation }: Props) {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState<'hours' | 'days' | 'weeks'>('days');
  const [isRecording, setIsRecording] = useState(false);

  const handleNext = () => {
    if (!symptoms.trim()) return;
    navigation.navigate('Severity', { symptoms, duration });
  };

  const addSymptom = (sym: string) => {
    const current = symptoms.split(',').map(s => s.trim()).filter(Boolean);
    if (!current.includes(sym)) {
      setSymptoms(symptoms ? `${symptoms}, ${sym}` : sym);
    }
  };

  return (
    <ScrollView className="flex-1 bg-light-bg dark:bg-dark-bg p-4">
      <View className="mt-8 mb-6">
        <Text className="text-2xl font-bold text-text-primary mb-2">What are your symptoms?</Text>
        <Text className="text-text-muted">Describe how you're feeling or select from common symptoms below.</Text>
      </View>

      <View className="mb-6 relative">
        <TextInput
          className="border border-gray-300 rounded-xl p-4 bg-white text-lg min-h-[120px]"
          multiline
          placeholder="e.g. I have a severe headache and slight fever..."
          value={symptoms}
          onChangeText={setSymptoms}
          textAlignVertical="top"
        />
        <TouchableOpacity 
          className={`absolute bottom-4 right-4 p-3 rounded-full ${isRecording ? 'bg-danger' : 'bg-primary'}`}
          onPress={() => setIsRecording(!isRecording)}
        >
          {isRecording ? <MicOff color="#fff" size={24} /> : <Mic color="#fff" size={24} />}
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-semibold text-text-primary mb-3">Common Symptoms</Text>
      <View className="flex-row flex-wrap mb-6">
        {COMMON_SYMPTOMS.slice(0, 10).map(sym => (
          <TouchableOpacity 
            key={sym} 
            className="bg-light-surface px-4 py-2 rounded-full mr-2 mb-2 border border-gray-200"
            onPress={() => addSymptom(sym)}
          >
            <Text className="text-text-primary">{sym}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-lg font-semibold text-text-primary mb-3">How long have you felt this way?</Text>
      <View className="flex-row justify-between mb-8">
        {['hours', 'days', 'weeks'].map(d => (
          <TouchableOpacity 
            key={d}
            className={`flex-1 py-3 items-center border rounded-lg mx-1 ${duration === d ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
            onPress={() => setDuration(d as any)}
          >
            <Text className={`font-semibold capitalize ${duration === d ? 'text-white' : 'text-text-primary'}`}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        className={`p-4 rounded-xl items-center ${symptoms.trim() ? 'bg-primary' : 'bg-gray-300'}`}
        onPress={handleNext}
        disabled={!symptoms.trim()}
      >
        <Text className="text-white font-bold text-lg">Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
