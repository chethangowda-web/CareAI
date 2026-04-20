import * as SecureStore from 'expo-secure-store';

export const setToken = async (token: string) => {
  await SecureStore.setItemAsync('careai_user_token', token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('careai_user_token');
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync('careai_user_token');
};
