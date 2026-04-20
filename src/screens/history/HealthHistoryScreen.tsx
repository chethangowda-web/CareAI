import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, ChevronDown, ChevronUp, AlertTriangle, BarChart2 } from 'lucide-react-native';
import { HealthRecord, UrgencyLevel } from '../../types/symptom.types';
import { useAuthStore } from '../../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  SELF_CARE: '#2E7D32',
  SEE_DOCTOR: '#1A73E8',
  GO_TO_HOSPITAL: '#F57F17',
  CALL_EMERGENCY: '#C62828',
};

export default function HealthHistoryScreen() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setRecords(data.records || []);
      } catch {
        // offline or error – show empty
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const urgencyLabel = (level: UrgencyLevel) => level.replace(/_/g, ' ');

  const renderItem = ({ item }: { item: HealthRecord }) => {
    const isExpanded = expanded === item.id;
    const color = URGENCY_COLORS[item.urgency_level] || '#757575';

    return (
      <View className="bg-white dark:bg-dark-surface rounded-xl mb-3 shadow-sm overflow-hidden">
        <TouchableOpacity
          className="p-4"
          onPress={() => setExpanded(isExpanded ? null : item.id)}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: color }} />
              <Text className="font-bold text-text-primary flex-1" numberOfLines={1}>
                {item.symptoms.length > 50 ? item.symptoms.slice(0, 50) + '…' : item.symptoms}
              </Text>
            </View>
            {isExpanded ? <ChevronUp color="#757575" size={20} /> : <ChevronDown color="#757575" size={20} />}
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Clock color="#757575" size={12} />
              <Text className="text-text-muted text-xs ml-1">{formatDate(item.created_at)}</Text>
            </View>
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '22' }}>
              <Text className="text-xs font-semibold" style={{ color }}>{urgencyLabel(item.urgency_level)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className="px-4 pb-4 border-t border-gray-100">
            <Text className="text-sm font-semibold text-text-muted mt-3 mb-1 uppercase tracking-wider">AI Assessment</Text>
            <Text className="text-text-primary text-sm leading-5 mb-3">{item.ai_explanation}</Text>

            <Text className="text-sm font-semibold text-text-muted mb-1 uppercase tracking-wider">Severity</Text>
            <View className="flex-row items-center mb-3">
              <View className="flex-1 h-2 bg-gray-200 rounded-full mr-3">
                <View
                  className="h-2 rounded-full"
                  style={{ width: `${item.severity * 10}%`, backgroundColor: item.severity > 7 ? '#C62828' : item.severity > 4 ? '#F57F17' : '#2E7D32' }}
                />
              </View>
              <Text className="font-bold text-text-primary">{item.severity}/10</Text>
            </View>

            {item.self_care_steps?.length > 0 && (
              <>
                <Text className="text-sm font-semibold text-text-muted mb-1 uppercase tracking-wider">Care Steps</Text>
                {item.self_care_steps.slice(0, 3).map((step, i) => (
                  <Text key={i} className="text-text-primary text-sm leading-5">• {step}</Text>
                ))}
              </>
            )}

            {item.escalation_flag && (
              <View className="flex-row items-center bg-danger/10 px-3 py-2 rounded-lg mt-3">
                <AlertTriangle color="#C62828" size={16} />
                <Text className="text-danger text-sm font-semibold ml-2">⚠ Medical escalation was recommended</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-surface dark:bg-dark-bg">
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text className="text-text-muted mt-4">Loading your health history...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-surface dark:bg-dark-bg">
      <View className="bg-white dark:bg-dark-surface px-4 pt-14 pb-4 shadow-sm">
        <Text className="text-2xl font-bold text-text-primary">Health History</Text>
        <Text className="text-text-muted text-sm mt-1">{records.length} record{records.length !== 1 ? 's' : ''}</Text>
      </View>

      {records.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <BarChart2 color="#CBD5E1" size={64} />
          <Text className="text-text-primary font-bold text-lg mt-4">No history yet</Text>
          <Text className="text-text-muted text-center mt-2">
            Start an AI checkup and your results will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}
