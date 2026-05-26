import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplets, Wind, Thermometer, Compass, Sun, CloudRain } from 'lucide-react-native';
import { ClimateData } from '../types/climate';
import { climateHelpers } from '../utils/climateHelpers';
import { CLIMATE_COLORS } from '../constants/climateConfig';

interface WeatherCardProps {
  data: ClimateData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  const IconComponent = climateHelpers.getWmoIcon(data.weatherCode);
  const themeColor = climateHelpers.getWmoColor(data.weatherCode);
  const rainProb = climateHelpers.getRainProbabilityByCode(data.weatherCode);

  // Estimate a realistic UV index based on temperature and rain probability
  const getUvIndex = () => {
    if (rainProb > 50) return { val: 1, label: 'Low' };
    if (data.temperature > 35) return { val: 8, label: 'Very High' };
    if (data.temperature > 30) return { val: 6, label: 'High' };
    if (data.temperature > 20) return { val: 4, label: 'Moderate' };
    return { val: 2, label: 'Low' };
  };
  const uv = getUvIndex();

  return (
    <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-5">
      {/* Location and Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1 pr-2">
          <Text style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: '800', color: '#1E293B' }}>
            {data.name}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '500', color: '#64748B', marginTop: 2 }}>
            Current Weather Conditions
          </Text>
        </View>
        <View className="bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-100">
          <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: CLIMATE_COLORS.primary }}>
            Live
          </Text>
        </View>
      </View>

      {/* Main Temperature Display */}
      <View className="flex-row items-center justify-between my-2">
        <View>
          <View className="flex-row items-start">
            <Text style={{ fontFamily: 'Inter', fontSize: 62, fontWeight: '900', color: '#0F172A', letterSpacing: -2 }}>
              {data.temperature}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 26, fontWeight: '700', color: CLIMATE_COLORS.primary, marginTop: 8 }}>
              °C
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '700', color: '#334155', marginTop: -2 }}>
            {data.condition}
          </Text>
        </View>
        
        {/* Weather Icon Box */}
        <View 
          className="w-24 h-24 rounded-3xl items-center justify-center border"
          style={{ 
            backgroundColor: `${themeColor}10`, // 10% opacity
            borderColor: `${themeColor}30` 
          }}
        >
          <IconComponent size={52} color={themeColor} />
        </View>
      </View>

      {/* Weather Attributes Grid */}
      <View className="flex-row justify-between border-t border-slate-100 pt-5 mt-4">
        {/* Humidity */}
        <View className="items-center flex-1">
          <Droplets size={20} color="#0284c7" />
          <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 6 }}>
            Humidity
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#1E293B', marginTop: 2 }}>
            {data.humidity}%
          </Text>
        </View>
        
        <View className="w-px bg-slate-100 h-10" />

        {/* Wind Speed */}
        <View className="items-center flex-1">
          <Wind size={20} color="#0d9488" />
          <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 6 }}>
            Wind Speed
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#1E293B', marginTop: 2 }}>
            {data.wind} km/h
          </Text>
        </View>

        <View className="w-px bg-slate-100 h-10" />

        {/* UV Index */}
        <View className="items-center flex-1">
          <Thermometer size={20} color="#e11d48" />
          <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 6 }}>
            UV Index
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#1E293B', marginTop: 2 }}>
            {uv.val} ({uv.label})
          </Text>
        </View>
      </View>

      {/* Secondary Metrics Row */}
      <View className="flex-row justify-between border-t border-slate-50 pt-4 mt-4">
        {/* Rain Probability / Rainfall */}
        <View className="flex-row items-center justify-start flex-1 gap-2 pl-2">
          <CloudRain size={16} color="#60a5fa" />
          <View>
            <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '500', color: '#64748B' }}>
              Rain Probability
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#1E293B' }}>
              {rainProb}% ({data.rainfall} mm)
            </Text>
          </View>
        </View>
        
        <View className="w-px bg-slate-100 h-8" />

        {/* Sunrise & Sunset */}
        <View className="flex-row items-center justify-start flex-1 gap-2 pl-4">
          <Sun size={16} color="#eab308" />
          <View>
            <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '500', color: '#64748B' }}>
              Daylight Hours
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#1E293B' }}>
              {data.sunrise} - {data.sunset}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
