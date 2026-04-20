import api from './api';
import { User } from '../types/auth.types';

export const getProfile = async (): Promise<User> => {
  const { data } = await api.get('/auth/profile');
  return data.user;
};

export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  const { data } = await api.patch('/auth/profile', updates);
  return data.user;
};
