import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, HomeStackParamList, SymptomStackParamList } from './types';
import { Home, HeartPulse, MapPin, AlertCircle, History, User } from 'lucide-react-native';

import HomeScreen from '../screens/home/HomeScreen';
import SymptomInputScreen from '../screens/symptoms/SymptomInputScreen';
import SeverityScreen from '../screens/symptoms/SeverityScreen';
import AnalysisLoadingScreen from '../screens/symptoms/AnalysisLoadingScreen';
import ResultsScreen from '../screens/symptoms/ResultsScreen';
import NearbyDoctorsScreen from '../screens/nearby/NearbyDoctorsScreen';
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
import HealthHistoryScreen from '../screens/history/HealthHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SymptomStack = createNativeStackNavigator<SymptomStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function SymptomStackNavigator() {
  return (
    <SymptomStack.Navigator screenOptions={{ headerShown: false }}>
      <SymptomStack.Screen name="SymptomInput" component={SymptomInputScreen} />
      <SymptomStack.Screen name="Severity" component={SeverityScreen} />
      <SymptomStack.Screen name="AnalysisLoading" component={AnalysisLoadingScreen} />
      <SymptomStack.Screen name="Results" component={ResultsScreen} />
    </SymptomStack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A73E8',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator} 
        options={{ tabBarLabel: 'Home', tabBarIcon: ({color, size}) => <Home color={color} size={size} /> }} 
      />
      <Tab.Screen 
        name="SymptomStack" 
        component={SymptomStackNavigator} 
        options={{ tabBarLabel: 'AI Check', tabBarIcon: ({color, size}) => <HeartPulse color={color} size={size} /> }} 
      />
      <Tab.Screen 
        name="Nearby" 
        component={NearbyDoctorsScreen} 
        options={{ tabBarLabel: 'Nearby', tabBarIcon: ({color, size}) => <MapPin color={color} size={size} /> }} 
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyScreen} 
        options={{ tabBarLabel: 'SOS', tabBarIcon: ({color, size}) => <AlertCircle color={color} size={size} /> }} 
      />
      <Tab.Screen 
        name="History" 
        component={HealthHistoryScreen} 
        options={{ tabBarLabel: 'History', tabBarIcon: ({color, size}) => <History color={color} size={size} /> }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({color, size}) => <User color={color} size={size} /> }} 
      />
    </Tab.Navigator>
  );
}
