import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { auth } from '../../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      Alert.alert('Success', 'Registered successfully. Please login.');
      navigation.navigate('Login');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-light-bg dark:bg-dark-bg">
      <Text className="text-3xl font-bold text-primary mb-8 text-center">Create Account</Text>

      <View className="mb-4">
        <Text className="text-text-primary mb-2">Name</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 bg-white"
          value={name}
          onChangeText={setName}
        />
      </View>

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

      <TouchableOpacity onPress={handleRegister} className="bg-primary p-4 rounded-lg items-center mb-4">
        <Text className="text-white font-bold text-lg">Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} className="items-center mt-2">
        <Text className="text-primary font-semibold">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
