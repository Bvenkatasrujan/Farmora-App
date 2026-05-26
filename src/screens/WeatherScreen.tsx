import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, AlertCircle, Sparkles } from 'lucide-react-native';
import { useClimate } from '../hooks/useClimate';
import { WeatherCard } from '../components/WeatherCard';
import { AlertCard } from '../components/AlertCard';
import { ClimateInsightCard } from '../components/ClimateInsightCard';
import { ForecastCard } from '../components/ForecastCard';
import { CLIMATE_COLORS } from '../constants/climateConfig';
import { climateService } from '../services/climateService';

export default function WeatherScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState<string | undefined>(undefined);
  const { currentWeather, forecast, alerts, recommendations, loading, error, refresh } = useClimate(searchedLocation);

  const [aiInsights, setAiInsights] = useState<{ summary: string; insights: Array<{ title: string; desc: string }> } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch AI insights whenever currentWeather or forecast changes
  useEffect(() => {
    if (currentWeather && forecast && forecast.length > 0) {
      const fetchAIInsights = async () => {
        setAiLoading(true);
        try {
          const insights = await climateService.getAIWeatherInsights(currentWeather, forecast);
          setAiInsights(insights);
        } catch (err) {
          console.error('Error fetching AI weather insights:', err);
        } finally {
          setAiLoading(false);
        }
      };
      fetchAIInsights();
    } else {
      setAiInsights(null);
    }
  }, [currentWeather, forecast]);

  return (
    <View className="flex-1 bg-emerald-50/20" style={{ paddingTop: insets.top }}>
      {/* Premium Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:scale-95"
        >
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: '#1E293B' }}>
          Farming Climate Assistant
        </Text>
        <TouchableOpacity 
          onPress={refresh} 
          disabled={loading}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1E293B" />
          ) : (
            <RefreshCw size={16} color="#1E293B" />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View className="px-5 pt-4 pb-2 bg-white flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-1.5">
          <TextInput
            placeholder="Search city (e.g., Chicago, Mumbai)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                setSearchedLocation(searchQuery.trim());
              }
            }}
            className="flex-1 text-slate-800 font-semibold"
            style={{ fontFamily: 'Inter', fontSize: 13, height: 36 }}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            if (searchQuery.trim()) {
              setSearchedLocation(searchQuery.trim());
            }
          }}
          className="bg-emerald-600 px-4 py-2.5 rounded-2xl active:scale-95 flex-row items-center justify-center"
        >
          <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#FFF' }}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Live Location Reset Pill */}
      {searchedLocation && (
        <View className="px-5 py-2 flex-row items-center justify-between bg-emerald-50/40 border-b border-emerald-100/50">
          <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: '#047857' }} className="flex-1 mr-2">
            Viewing: "{searchedLocation}"
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchedLocation(undefined);
              setSearchQuery('');
            }}
            className="flex-row items-center gap-1 bg-white border border-emerald-200 px-2 py-1 rounded-full active:scale-95"
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: '#047857' }}>
              Reset to Live
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Bar */}
      {error && (
        <View className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex-row items-center gap-2">
          <AlertCircle size={15} color={CLIMATE_COLORS.warning} />
          <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#7c2d12', flex: 1 }}>
            {error}
          </Text>
        </View>
      )}

      {/* Main Container */}
      {loading && !currentWeather ? (
        <View className="flex-1 items-center justify-center p-10">
          <ActivityIndicator size="large" color={CLIMATE_COLORS.primary} />
          <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: '#64748B', marginTop: 15, textAlign: 'center' }}>
            Retrieving localized climate & weather intelligence...
          </Text>
        </View>
      ) : !currentWeather ? (
        <View className="flex-1 items-center justify-center p-10">
          <AlertCircle size={40} color={CLIMATE_COLORS.danger} />
          <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 12 }}>
            Weather Data Unavailable
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
            Ensure your device has internet access and your profile location is set correctly.
          </Text>
          <TouchableOpacity 
            onPress={refresh} 
            className="mt-6 px-5 py-2.5 rounded-full bg-emerald-700 active:scale-95"
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#FFF' }}>
              Retry Fetching
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} colors={[CLIMATE_COLORS.primary]} />
          }
        >
          {/* Current Weather Card */}
          <WeatherCard data={currentWeather} />

          {/* AI Weather Insights Card */}
          <View className="mb-6 bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm" style={{ borderColor: 'rgba(0, 110, 47, 0.1)' }}>
            <View className="flex-row items-center justify-between mb-3.5">
              <View className="flex-row items-center gap-2">
                <Sparkles size={18} color="#059669" />
                <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#0F172A' }}>
                  AI Weather & Sowing Advisor
                </Text>
              </View>
              {aiLoading && <ActivityIndicator size="small" color="#059669" />}
            </View>

            {aiLoading ? (
              <View className="py-4 items-center">
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                  AI Assistant is analyzing forecast details...
                </Text>
              </View>
            ) : aiInsights ? (
              <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: '#334155', lineHeight: 19 }} className="mb-4 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                  {aiInsights.summary}
                </Text>

                {aiInsights.insights.map((insight, idx) => (
                  <View key={idx} className="mb-3 flex-row gap-3">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2" />
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#1E293B' }}>
                        {insight.title}
                      </Text>
                      <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#475569', lineHeight: 17, marginTop: 2 }} className="font-semibold">
                        {insight.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748B' }}>
                Fetch weather to see dynamic AI farm advice.
              </Text>
            )}
          </View>

          {/* Farming Weather Alerts */}
          <AlertCard alerts={alerts} />

          {/* Smart Farming Insights */}
          <ClimateInsightCard insights={recommendations} />

          {/* 7-Day Forecast */}
          <ForecastCard forecast={forecast} />
        </ScrollView>
      )}
    </View>
  );
}
