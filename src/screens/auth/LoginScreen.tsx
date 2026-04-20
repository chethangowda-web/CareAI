import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    useAuthStore.getState().setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      setAuth({
        id: userCredential.user.uid,
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || 'User',
        phone: userCredential.user.phoneNumber || '',
        created_at: new Date().toISOString()
      }, token);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
      useAuthStore.getState().setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-light-bg dark:bg-dark-bg">
      <Text className="text-3xl font-bold text-primary mb-8 text-center">CareAI</Text>
      
      <View className="mb-4">
        <Text className="text-text-primary mb-2">Email</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 bg-white"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View className="mb-6">
        <Text className="text-text-primary mb-2">Password</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 bg-white"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity onPress={handleLogin} className="bg-primary p-4 rounded-lg items-center mb-4">
        <Text className="text-white font-bold text-lg">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} className="items-center mt-2">
        <Text className="text-primary font-semibold">Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}
