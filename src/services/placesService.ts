import api from './api';
import { Place } from '../types/places.types';

export const getNearbyPlaces = async (lat: number, lng: number, type: 'doctor' | 'hospital'): Promise<Place[]> => {
  const { data } = await api.get('/places/nearby', { params: { lat, lng, type } });
  return data.places;
};
