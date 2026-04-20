import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeStackParamList, MainTabParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { HeartPulse, MapPin, AlertCircle, Clock } from 'lucide-react-native';
import { useBiometric } from '../../hooks/useBiometric';

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const user = useAuthStore(state => state.user);
  const { authenticate } = useBiometric();

  useEffect(() => {
    // Optionally trigger biometric on app return
    // authenticate();
  }, []);

  return (
    <ScrollView className="flex-1 bg-light-surface dark:bg-dark-surface p-4">
      <View className="mt-8 mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-text-muted">Welcome back,</Text>
          <Text className="text-2xl font-bold text-text-primary">{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
            <Text className="text-white text-lg font-bold">{user?.name?.[0] || 'U'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="bg-primary rounded-2xl p-6 mb-6 flex-row items-center justify-between shadow-lg">
        <View className="flex-1 mr-4">
          <Text className="text-white text-xl font-bold mb-2">How are you feeling?</Text>
          <Text className="text-white opacity-80 mb-4">Check your symptoms instantly with our AI assistant.</Text>
          <TouchableOpacity 
            className="bg-white px-4 py-2 rounded-full self-start"
            onPress={() => navigation.navigate('SymptomStack', { screen: 'SymptomInput' })}
          >
            <Text className="text-primary font-bold">Start AI Check</Text>
          </TouchableOpacity>
        </View>
        <HeartPulse color="#fff" size={64} />
      </View>

      <Text className="text-lg font-bold text-text-primary mb-4">Quick Actions</Text>
      
      <View className="flex-row flex-wrap justify-between">
        <TouchableOpacity 
          className="w-[48%] bg-white dark:bg-dark-bg p-4 rounded-xl mb-4 items-center shadow-sm"
          onPress={() => navigation.navigate('Nearby')}
        >
          <MapPin color="#00897B" size={32} />
          <Text className="mt-2 font-semibold text-text-primary">Nearby Help</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-[48%] bg-white dark:bg-dark-bg p-4 rounded-xl mb-4 items-center shadow-sm"
          onPress={() => navigation.navigate('Emergency')}
        >
          <AlertCircle color="#C62828" size={32} />
          <Text className="mt-2 font-semibold text-text-primary">Emergency</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-[48%] bg-white dark:bg-dark-bg p-4 rounded-xl mb-4 items-center shadow-sm"
          onPress={() => navigation.navigate('History')}
        >
          <Clock color="#1A73E8" size={32} />
          <Text className="mt-2 font-semibold text-text-primary">History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
