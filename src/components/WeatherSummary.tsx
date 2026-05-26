import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, CloudRain } from 'lucide-react-native';
import { ClimateData, WeatherAlert } from '../types/climate';
import { climateHelpers } from '../utils/climateHelpers';
import { CLIMATE_COLORS } from '../constants/climateConfig';

interface WeatherSummaryProps {
  data: ClimateData | null;
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
}

export const WeatherSummary: React.FC<WeatherSummaryProps> = ({ data, alerts, loading, error }) => {
  const router = useRouter();

  if (loading) {
    return (
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex-row items-center justify-between min-h-[90px] mb-5">
        <View className="flex-row items-center gap-3">
          <ActivityIndicator color={CLIMATE_COLORS.primary} size="small" />
          <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: '#64748B' }}>
            Loading local climate data...
          </Text>
        </View>
      </View>
    );
  }

  if (error && !data) {
    return (
      <TouchableOpacity 
        onPress={() => router.push('/weather-report')}
        className="bg-red-50/50 rounded-3xl p-5 border border-red-100 flex-row items-center justify-between mb-5"
      >
        <View className="flex-1 pr-2">
          <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: CLIMATE_COLORS.danger }}>
            Weather connection failed
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 }}>
            Tap to view weather report details
          </Text>
        </View>
        <ChevronRight size={18} color={CLIMATE_COLORS.danger} />
      </TouchableOpacity>
    );
  }

  if (!data) return null;

  const IconComponent = climateHelpers.getWmoIcon(data.weatherCode);
  const iconColor = climateHelpers.getWmoColor(data.weatherCode);

  // Short banner alert summary
  let alertSummary = 'Normal weather conditions for farming.';
  if (alerts.length > 0) {
    alertSummary = alerts[0].title;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/weather-report')}
      className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex-row items-center justify-between mb-5"
    >
      <View className="flex-1 pr-4">
        {/* Location & Temp */}
        <View className="flex-row items-baseline gap-1.5">
          <Text style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: '900', color: '#0F172A' }}>
            {data.temperature}°C
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#475569' }}>
            in {data.name.split(',')[0]}
          </Text>
        </View>

        {/* Condition Summary */}
        <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 1 }}>
          {data.condition} • {data.humidity}% Humidity
        </Text>

        {/* Dynamic Alert Banner */}
        <View className="flex-row items-center gap-1.5 mt-2 bg-emerald-50 px-2 py-1 rounded-lg self-start">
          <Text 
            numberOfLines={1}
            style={{ 
              fontFamily: 'Inter', 
              fontSize: 10, 
              fontWeight: '800', 
              color: alerts.length > 0 ? CLIMATE_COLORS.warning : CLIMATE_COLORS.primary 
            }}
          >
            {alerts.length > 0 ? '⚠️ ' : '🌱 '} {alertSummary}
          </Text>
        </View>
      </View>

      {/* Right side Icon & Arrow */}
      <View className="flex-row items-center gap-3">
        <View 
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: `${iconColor}10` }}
        >
          <IconComponent size={24} color={iconColor} />
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );
};
