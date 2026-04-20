import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User, LogOut, Shield, FileText, Bell, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          await logout();
        },
      },
    ]);
  };

  const MENU_ITEMS = [
    { icon: Bell, label: 'Notifications', color: '#1A73E8' },
    { icon: FileText, label: 'Export Health Data', color: '#00897B' },
    { icon: Shield, label: 'Privacy & Security', color: '#F57F17' },
  ];

  return (
    <ScrollView className="flex-1 bg-light-surface dark:bg-dark-bg">
      {/* Header */}
      <View className="bg-primary pt-14 pb-10 px-6 items-center">
        <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4">
          <Text className="text-white text-4xl font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text className="text-white text-xl font-bold">{user?.name || 'User'}</Text>
        <Text className="text-white opacity-80 mt-1">{user?.email}</Text>
      </View>

      {/* Disclaimer card */}
      <View className="bg-blue-50 dark:bg-dark-surface mx-4 -mt-4 rounded-xl p-4 mb-6 shadow-sm">
        <Text className="text-xs text-text-muted leading-5 italic text-center">
          CareAI provides health information for guidance only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
        </Text>
      </View>

      {/* Menu */}
      <View className="bg-white dark:bg-dark-surface mx-4 rounded-xl mb-4 shadow-sm overflow-hidden">
        {MENU_ITEMS.map(({ icon: Icon, label, color }, index) => (
          <TouchableOpacity
            key={label}
            className={`flex-row items-center p-4 ${index < MENU_ITEMS.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: color + '22' }}>
              <Icon color={color} size={20} />
            </View>
            <Text className="flex-1 font-semibold text-text-primary">{label}</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        className="bg-white dark:bg-dark-surface mx-4 rounded-xl p-4 mb-10 shadow-sm flex-row items-center"
        onPress={handleLogout}
      >
        <View className="w-10 h-10 bg-danger/10 rounded-full items-center justify-center mr-4">
          <LogOut color="#C62828" size={20} />
        </View>
        <Text className="flex-1 font-semibold text-danger">Sign Out</Text>
        <ChevronRight color="#CBD5E1" size={20} />
      </TouchableOpacity>
    </ScrollView>
  );
}
