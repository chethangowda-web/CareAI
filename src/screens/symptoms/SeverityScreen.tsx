import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SymptomStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<SymptomStackParamList, 'Severity'>;
  route: RouteProp<SymptomStackParamList, 'Severity'>;
};

export default function SeverityScreen({ navigation, route }: Props) {
  const { symptoms, duration } = route.params;
  const [severity, setSeverity] = useState<number>(5);
  const [temperature, setTemperature] = useState('');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  const handleNext = () => {
    navigation.navigate('AnalysisLoading', { 
      symptoms, 
      duration, 
      severity, 
      temperature: Number(temperature) || 0, 
      temperatureUnit: tempUnit 
    });
  };

  return (
    <ScrollView className="flex-1 bg-light-bg dark:bg-dark-bg p-4">
      <View className="mt-8 mb-6">
        <Text className="text-2xl font-bold text-text-primary mb-2">How severe is it?</Text>
        <Text className="text-text-muted">Rate your discomfort from 1 to 10.</Text>
      </View>

      <View className="items-center mb-8">
        <Text className="text-4xl font-bold text-primary mb-4">{severity}/10</Text>
        <View className="flex-row justify-between w-full mb-2">
          <Text className="text-success">Mild</Text>
          <Text className="text-danger">Severe</Text>
        </View>
        <View className="flex-row w-full justify-between mt-2">
          {[1,2,3,4,5,6,7,8,9,10].map(val => (
            <TouchableOpacity 
              key={val}
              onPress={() => setSeverity(val)}
              className={`w-8 h-8 rounded-full items-center justify-center ${severity === val ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <Text className={severity === val ? 'text-white' : 'text-text-primary'}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold text-text-primary mb-3">Temperature (Optional)</Text>
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 border border-gray-300 rounded-xl p-4 bg-white text-lg mr-4"
            placeholder="e.g. 98.6"
            keyboardType="numeric"
            value={temperature}
            onChangeText={setTemperature}
          />
          <View className="flex-row bg-gray-200 rounded-xl p-1">
            <TouchableOpacity 
              className={`px-4 py-3 rounded-lg ${tempUnit === 'C' ? 'bg-white shadow' : ''}`}
              onPress={() => setTempUnit('C')}
            >
              <Text className={`font-bold ${tempUnit === 'C' ? 'text-primary' : 'text-gray-500'}`}>°C</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-4 py-3 rounded-lg ${tempUnit === 'F' ? 'bg-white shadow' : ''}`}
              onPress={() => setTempUnit('F')}
            >
              <Text className={`font-bold ${tempUnit === 'F' ? 'text-primary' : 'text-gray-500'}`}>°F</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        className="bg-primary p-4 rounded-xl items-center mt-auto mb-8"
        onPress={handleNext}
      >
        <Text className="text-white font-bold text-lg">Analyze Symptoms</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
