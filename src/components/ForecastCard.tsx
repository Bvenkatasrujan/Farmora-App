import React from 'react';
import { View, Text } from 'react-native';
import { ForecastDay } from '../types/climate';
import { climateHelpers } from '../utils/climateHelpers';

interface ForecastCardProps {
  forecast: ForecastDay[];
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <View className="mb-6">
      <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: '#0F172A' }} className="mb-3">
        {forecast.length}-Day Forecast
      </Text>

      <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {forecast.map((item, idx) => {
          const Icon = climateHelpers.getWmoIcon(item.weatherCode);
          const iconColor = climateHelpers.getWmoColor(item.weatherCode);
          const isLast = idx === forecast.length - 1;
          const displayDay = idx === 0 ? 'Today' : item.date;

          return (
            <View 
              key={idx}
              className={`flex-row items-center justify-between p-4 ${
                !isLast ? 'border-b border-slate-50' : ''
              }`}
            >
              {/* Date Column */}
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#1E293B', width: 60 }}>
                {displayDay}
              </Text>
              
              {/* Icon & Description Column */}
              <View className="flex-row items-center gap-2 flex-1 justify-start pl-4">
                <Icon size={18} color={iconColor} />
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '600', color: '#475569' }}>
                  {item.description}
                </Text>
              </View>

              {/* Temp Column */}
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: '#0F172A', textAlign: 'right' }}>
                {item.tempMax}° / {item.tempMin}°
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
