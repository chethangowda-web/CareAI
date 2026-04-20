import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { MapPin, Phone, Star, Navigation, RefreshCw } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Place } from '../../types/places.types';
import { useAuthStore } from '../../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function NearbyDoctorsScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'doctor' | 'hospital'>('doctor');
  const token = useAuthStore(state => state.token);

  const fetchNearby = async (type: 'doctor' | 'hospital') => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable it in settings.');
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `${API_URL}/places/nearby?lat=${latitude}&lng=${longitude}&type=${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) {
        setPlaces(data.places || []);
      } else {
        setError(data.error || 'Failed to fetch nearby places.');
      }
    } catch (e) {
      setError('Unable to fetch nearby facilities. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNearby(activeType); }, [activeType]);

  const openDirections = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_name=${encodeURIComponent(name)}`;
    Linking.openURL(url);
  };

  const callPlace = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const distanceLabel = (meters: number) => {
    if (meters < 1000) return `${meters}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const renderItem = ({ item }: { item: Place }) => (
    <View className="bg-white dark:bg-dark-surface rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-bold text-text-primary flex-1 mr-2" numberOfLines={2}>{item.name}</Text>
        {item.rating && (
          <View className="flex-row items-center bg-warning/10 px-2 py-1 rounded-full">
            <Star color="#F57F17" size={12} fill="#F57F17" />
            <Text className="text-warning text-xs font-bold ml-1">{item.rating}</Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center mb-3">
        <MapPin color="#757575" size={14} />
        <Text className="text-text-muted text-sm ml-1 flex-1" numberOfLines={1}>{item.vicinity}</Text>
        <Text className="text-primary text-sm font-semibold ml-2">{distanceLabel(item.distance)}</Text>
      </View>
      {item.open_now !== undefined && (
        <Text className={`text-xs font-semibold mb-3 ${item.open_now ? 'text-success' : 'text-danger'}`}>
          {item.open_now ? '● Open Now' : '● Closed'}
        </Text>
      )}
      <View className="flex-row space-x-2">
        {item.phone && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center p-2 bg-primary/10 rounded-lg"
            onPress={() => callPlace(item.phone!)}
          >
            <Phone color="#1A73E8" size={16} />
            <Text className="text-primary font-semibold ml-1 text-sm">Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center p-2 bg-secondary/10 rounded-lg"
          onPress={() => openDirections(item.lat, item.lng, item.name)}
        >
          <Navigation color="#00897B" size={16} />
          <Text className="text-secondary font-semibold ml-1 text-sm">Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-light-surface dark:bg-dark-bg">
      <View className="bg-white dark:bg-dark-surface px-4 pt-14 pb-4">
        <Text className="text-2xl font-bold text-text-primary mb-4">Nearby Help</Text>
        <View className="flex-row bg-light-surface dark:bg-dark-bg rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${activeType === 'doctor' ? 'bg-primary' : ''}`}
            onPress={() => setActiveType('doctor')}
          >
            <Text className={`font-semibold ${activeType === 'doctor' ? 'text-white' : 'text-text-muted'}`}>Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${activeType === 'hospital' ? 'bg-primary' : ''}`}
            onPress={() => setActiveType('hospital')}
          >
            <Text className={`font-semibold ${activeType === 'hospital' ? 'text-white' : 'text-text-muted'}`}>Hospitals</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1A73E8" />
          <Text className="text-text-muted mt-4">Finding nearby facilities...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <MapPin color="#C62828" size={48} />
          <Text className="text-text-primary font-bold text-lg mt-4 text-center">{error}</Text>
          <TouchableOpacity
            className="mt-6 bg-primary px-6 py-3 rounded-xl flex-row items-center"
            onPress={() => fetchNearby(activeType)}
          >
            <RefreshCw color="#fff" size={18} />
            <Text className="text-white font-bold ml-2">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : places.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-text-muted text-center">No {activeType === 'doctor' ? 'doctors' : 'hospitals'} found nearby.</Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}
