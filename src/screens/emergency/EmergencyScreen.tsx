import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, Modal } from 'react-native';
import { Phone, AlertTriangle, MapPin, Shield } from 'lucide-react-native';
import { EMERGENCY_NUMBERS } from '../../constants/emergency';
import { useAuthStore } from '../../store/authStore';

const EMERGENCY_CONTACTS = [
  { label: 'National Emergency', number: '112', color: '#C62828', icon: '🚨' },
  { label: 'Ambulance (108)', number: '108', color: '#C62828', icon: '🚑' },
  { label: 'Medical Helpline', number: '104', color: '#F57F17', icon: '💊' },
  { label: 'Pregnancy Ambulance', number: '102', color: '#00897B', icon: '🤰' },
  { label: 'Fire', number: '101', color: '#F57F17', icon: '🔥' },
  { label: 'Police', number: '100', color: '#1A73E8', icon: '👮' },
];

export default function EmergencyScreen() {
  const [confirmModal, setConfirmModal] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);

  const callNumber = (number: string) => {
    setConfirmModal(number);
  };

  const confirmCall = () => {
    if (confirmModal) {
      Linking.openURL(`tel:${confirmModal}`);
      setConfirmModal(null);
    }
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      <View className="bg-danger px-6 pt-14 pb-8">
        <View className="flex-row items-center">
          <AlertTriangle color="#fff" size={28} />
          <Text className="text-white text-2xl font-bold ml-3">Emergency</Text>
        </View>
        <Text className="text-white opacity-80 mt-2">Tap any number to call immediately</Text>
      </View>

      {/* SOS Big Button */}
      <View className="items-center -mt-6 mb-6">
        <TouchableOpacity
          onPress={() => callNumber('112')}
          className="w-32 h-32 bg-danger rounded-full items-center justify-center shadow-2xl border-4 border-white"
        >
          <Text className="text-white text-4xl font-black">SOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <Text className="text-lg font-bold text-text-primary mb-4">Emergency Helplines</Text>

        {EMERGENCY_CONTACTS.map(contact => (
          <TouchableOpacity
            key={contact.number}
            className="bg-white dark:bg-dark-surface rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
            onPress={() => callNumber(contact.number)}
          >
            <View
              style={{ backgroundColor: contact.color + '22' }}
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
            >
              <Text className="text-2xl">{contact.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-text-primary">{contact.label}</Text>
              <Text className="text-text-muted text-sm">{contact.number}</Text>
            </View>
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: contact.color }}>
              <Phone color="#fff" size={18} />
            </View>
          </TouchableOpacity>
        ))}

        <View className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-8 mt-4">
          <View className="flex-row items-center mb-2">
            <Shield color="#F57F17" size={18} />
            <Text className="font-bold text-warning ml-2">Remember</Text>
          </View>
          <Text className="text-text-muted text-sm leading-5">
            For life-threatening emergencies including chest pain, difficulty breathing, loss of consciousness, or stroke symptoms, call 112 immediately.
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={!!confirmModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-xl font-bold text-text-primary mb-2 text-center">Confirm Call</Text>
            <Text className="text-text-muted text-center mb-6">
              You are about to call <Text className="font-bold text-danger">{confirmModal}</Text>. Proceed?
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 p-4 border border-gray-300 rounded-xl items-center"
                onPress={() => setConfirmModal(null)}
              >
                <Text className="font-semibold text-text-muted">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-4 bg-danger rounded-xl items-center"
                onPress={confirmCall}
              >
                <Text className="font-bold text-white">Call Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
