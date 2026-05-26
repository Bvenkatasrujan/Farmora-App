import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { WeatherAlert } from '../types/climate';
import { CLIMATE_COLORS } from '../constants/climateConfig';

interface RainWarningCardProps {
  alert: WeatherAlert | null;
  onDismiss?: () => void;
}

export const RainWarningCard: React.FC<RainWarningCardProps> = ({ alert, onDismiss }) => {
  if (!alert) return null;

  const isDanger = alert.level === 'danger';
  const bgStyle = isDanger ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100';
  const textTitleColor = isDanger ? '#991b1b' : '#9a3412';
  const iconColor = isDanger ? CLIMATE_COLORS.danger : CLIMATE_COLORS.warning;

  return (
    <View 
      className={`p-4 rounded-2xl border flex-row items-start gap-3 mb-4 ${bgStyle}`}
    >
      <View className="mt-0.5">
        <AlertCircle size={18} color={iconColor} />
      </View>
      
      <View className="flex-1">
        <Text 
          style={{ 
            fontFamily: 'Inter', 
            fontSize: 13, 
            fontWeight: '800', 
            color: textTitleColor 
          }}
        >
          {alert.title}
        </Text>
        <Text 
          style={{ 
            fontFamily: 'Inter', 
            fontSize: 11, 
            fontWeight: '600', 
            color: '#475569', 
            lineHeight: 16,
            marginTop: 2 
          }}
        >
          {alert.description}
        </Text>
      </View>

      {onDismiss && (
        <TouchableOpacity 
          onPress={onDismiss}
          className="p-1 rounded-full active:bg-slate-200/50"
        >
          <X size={14} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
};
