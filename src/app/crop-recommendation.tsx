import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sprout, Droplets, Sun, ArrowLeft, Check, Sparkles, Thermometer, CloudRain, Gauge, HelpCircle, Layers, Calendar } from 'lucide-react-native';
import { FarmoraColors } from '../constants/colors';
import { useClimate } from '../hooks/useClimate';
import { cropService } from '../services/cropService';
import { Card } from '../components/ui/Card';
import { useAppStore } from '../store/useAppStore';

interface Recommendation {
  crop: string;
  suitability: number;
  expectedYield: string;
  duration: string;
  instructions: string;
}

const soilTypesList = ['Loamy', 'Clayey', 'Sandy', 'Black', 'Red', 'Alluvial', 'Laterite'];
const seasonsList = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'];

export default function CropRecommendationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentWeather } = useClimate();
  const { createNotification } = useAppStore();

  // Soil Nutrient inputs (N, P, K)
  const [nitrogen, setNitrogen] = useState('80');
  const [phosphorous, setPhosphorous] = useState('50');
  const [potassium, setPotassium] = useState('40');
  
  // Soil pH
  const [ph, setPh] = useState('6.5');

  // Climate inputs
  const [temperature, setTemperature] = useState('24');
  const [humidity, setHumidity] = useState('80');
  const [rainfall, setRainfall] = useState('100');

  // Soil Type & Season inputs
  const [soilType, setSoilType] = useState('Loamy');
  const [season, setSeason] = useState('Kharif (Monsoon)');

  // Dropdown menus visibility
  const [isSoilTypeOpen, setIsSoilTypeOpen] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [isWeatherPrefilled, setIsWeatherPrefilled] = useState(false);

  // Pre-populate weather parameters dynamically on load from useClimate
  useEffect(() => {
    if (currentWeather && !isWeatherPrefilled) {
      setTemperature(String(Math.round(currentWeather.temperature)));
      setHumidity(String(Math.round(currentWeather.humidity)));
      // Default rainfall approximation (uses rainfall or defaults to 110mm)
      setRainfall(String(Math.round(currentWeather.rainfall || 110)));
      setIsWeatherPrefilled(true);
    }
  }, [currentWeather, isWeatherPrefilled]);

  const handleRecommend = async () => {
    // Close dropdowns
    setIsSoilTypeOpen(false);
    setIsSeasonOpen(false);

    // Validation
    if (!nitrogen || !phosphorous || !potassium || !ph || !temperature || !humidity || !rainfall) {
      Alert.alert('Missing Parameters', 'Please fill in all soil nutrient and environmental fields.');
      return;
    }

    const pHVal = parseFloat(ph);
    if (isNaN(pHVal) || pHVal < 0 || pHVal > 14) {
      Alert.alert('Invalid pH', 'Soil pH must be a number between 0 and 14.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const soilData = {
        nitrogen,
        phosphorous,
        potassium,
        temperature,
        humidity,
        ph,
        rainfall,
        soilType,
        season
      };

      // 1. Run the nearest centroid matching algorithm to find the ideal crop type
      const recommendedCropName = cropService.recommendCrop(soilData);

      // 2. Query Groq to get yield projections and detailed instructions based on inputs
      const instructions = await cropService.getCropInstructions(recommendedCropName, soilData);

      setResult({
        crop: recommendedCropName,
        suitability: instructions.suitability || 95,
        expectedYield: instructions.expectedYield || '4.0 - 5.0 Tons/Hectare',
        duration: instructions.duration || '110-120 Days',
        instructions: instructions.instructions || 'Sow seeds at appropriate depth and water regularly.'
      });

      createNotification(
        `AI Recommended Crop: ${recommendedCropName}`,
        `Your farm soil matches ${recommendedCropName} by ${instructions.suitability || 95}%. Expected yield is ${instructions.expectedYield || '4.0-5.0 Tons/Hectare'} in ${instructions.duration || '110-120 Days'}.`,
        'system'
      );
    } catch (err: any) {
      console.error('Crop Recommendation Error:', err);
      Alert.alert('Failed to Recommendation', 'An error occurred during calculations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: FarmoraColors.background, paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:scale-95"
        >
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: '#1E293B' }}>
          Crop Recommendation
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Intro Banner */}
        <View className="mb-5 p-4 rounded-3xl bg-emerald-50 border border-emerald-100/50">
          <View className="flex-row items-center gap-2 mb-1.5">
            <Sparkles size={18} color={FarmoraColors.primary} />
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.primary }}>
              NPK Nearest Centroid Analyzer
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#334155', lineHeight: 18 }} className="font-semibold">
            Input soil nutrients (N, P, K), pH level, and climatic conditions to find the crop matching your farm's unique profile.
          </Text>
        </View>

        {/* Form Container */}
        <View className="gap-5">
          {/* Card 1: Soil Nutrients NPK */}
          <Card variant="white" className="p-4 bg-white border border-slate-100" style={{ borderRadius: 24 }}>
            <View className="flex-row items-center gap-2 mb-3">
              <Gauge size={16} color={FarmoraColors.primary} />
              <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.textDark }}>
                Soil Nutrients (NPK)
              </Text>
            </View>

            <View className="flex-row gap-3">
              {/* Nitrogen */}
              <View className="flex-1">
                <Text style={styles.inputLabel}>N (Nitrogen)</Text>
                <TextInput
                  value={nitrogen}
                  onChangeText={setNitrogen}
                  keyboardType="numeric"
                  placeholder="e.g. 80"
                  style={styles.textInput}
                />
              </View>

              {/* Phosphorous */}
              <View className="flex-1">
                <Text style={styles.inputLabel}>P (Phosphorus)</Text>
                <TextInput
                  value={phosphorous}
                  onChangeText={setPhosphorous}
                  keyboardType="numeric"
                  placeholder="e.g. 50"
                  style={styles.textInput}
                />
              </View>

              {/* Potassium */}
              <View className="flex-1">
                <Text style={styles.inputLabel}>K (Potassium)</Text>
                <TextInput
                  value={potassium}
                  onChangeText={setPotassium}
                  keyboardType="numeric"
                  placeholder="e.g. 40"
                  style={styles.textInput}
                />
              </View>
            </View>
            <Text style={{ fontFamily: 'Inter', fontSize: 10, color: FarmoraColors.textGray, marginTop: 8 }} className="italic font-semibold">
              Enter values in mg/kg.
            </Text>
          </Card>

          {/* Card 2: Soil pH */}
          <Card variant="white" className="p-4 bg-white border border-slate-100" style={{ borderRadius: 24 }}>
            <View className="flex-row items-center gap-2 mb-3">
              <HelpCircle size={16} color={FarmoraColors.primary} />
              <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.textDark }}>
                Soil pH level
              </Text>
            </View>

            <View className="flex-row items-center gap-4">
              <TextInput
                value={ph}
                onChangeText={setPh}
                keyboardType="numeric"
                placeholder="6.5"
                style={[styles.textInput, { width: 80 }]}
              />
              <View className="flex-1">
                <Text style={{ fontFamily: 'Inter', fontSize: 11, color: FarmoraColors.textGray, lineHeight: 15 }} className="font-semibold">
                  Scale of 0 to 14. Neutral is 7.0. Most crops thrive in 6.0 to 7.5 range.
                </Text>
              </View>
            </View>
          </Card>

          {/* Card 3: Climate & Environment */}
          <Card variant="white" className="p-4 bg-white border border-slate-100" style={{ borderRadius: 24 }}>
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-2">
                <Sun size={16} color={FarmoraColors.primary} />
                <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.textDark }}>
                  Climate & Weather
                </Text>
              </View>
              {isWeatherPrefilled && (
                <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                  <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: '800', color: FarmoraColors.primary }}>
                    PREFILLED BY LIVE WEATHER
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-col gap-3">
              {/* Temperature */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Thermometer size={14} color="#64748B" />
                  <Text style={styles.climateLabel}>Temperature (°C)</Text>
                </View>
                <TextInput
                  value={temperature}
                  onChangeText={setTemperature}
                  keyboardType="numeric"
                  placeholder="24"
                  style={[styles.textInput, { width: 100, textAlign: 'right' }]}
                />
              </View>

              {/* Humidity */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Droplets size={14} color="#64748B" />
                  <Text style={styles.climateLabel}>Humidity (%)</Text>
                </View>
                <TextInput
                  value={humidity}
                  onChangeText={setHumidity}
                  keyboardType="numeric"
                  placeholder="80"
                  style={[styles.textInput, { width: 100, textAlign: 'right' }]}
                />
              </View>

              {/* Rainfall */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <CloudRain size={14} color="#64748B" />
                  <Text style={styles.climateLabel}>Rainfall (mm)</Text>
                </View>
                <TextInput
                  value={rainfall}
                  onChangeText={setRainfall}
                  keyboardType="numeric"
                  placeholder="100"
                  style={[styles.textInput, { width: 100, textAlign: 'right' }]}
                />
              </View>
            </View>
          </Card>

          {/* Card 4: Soil Type & Season */}
          <Card variant="white" className="p-4 bg-white border border-slate-100" style={{ borderRadius: 24, zIndex: 10 }}>
            <View className="flex-row items-center gap-2 mb-3">
              <Layers size={16} color={FarmoraColors.primary} />
              <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.textDark }}>
                Soil Type & Season
              </Text>
            </View>

            <View className="flex-row gap-3">
              {/* Soil Type Selection */}
              <View className="flex-1 relative z-50">
                <Text style={styles.inputLabel}>Soil Type</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSoilTypeOpen(!isSoilTypeOpen);
                    setIsSeasonOpen(false);
                  }}
                  className="flex-row items-center justify-between px-3 border"
                  style={styles.dropdownTrigger}
                >
                  <Text style={styles.dropdownText}>{soilType}</Text>
                  <Text style={{ fontSize: 10, color: '#94A3B8' }}>{isSoilTypeOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isSoilTypeOpen && (
                  <View className="absolute bg-white border border-slate-200 rounded-xl p-1 w-full" style={styles.dropdownMenu}>
                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                      {soilTypesList.map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => {
                            setSoilType(type);
                            setIsSoilTypeOpen(false);
                          }}
                          className="py-2.5 px-3 flex-row justify-between items-center border-b border-slate-50 last:border-0"
                        >
                          <Text style={styles.dropdownItemText}>{type}</Text>
                          {soilType === type && <Check size={12} color={FarmoraColors.primary} />}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Season Selection */}
              <View className="flex-1 relative z-50">
                <Text style={styles.inputLabel}>Season</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSeasonOpen(!isSeasonOpen);
                    setIsSoilTypeOpen(false);
                  }}
                  className="flex-row items-center justify-between px-3 border"
                  style={styles.dropdownTrigger}
                >
                  <Text style={styles.dropdownText}>{season.split(' ')[0]}</Text>
                  <Text style={{ fontSize: 10, color: '#94A3B8' }}>{isSeasonOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isSeasonOpen && (
                  <View className="absolute bg-white border border-slate-200 rounded-xl p-1 w-full" style={styles.dropdownMenu}>
                    {seasonsList.map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => {
                          setSeason(s);
                          setIsSeasonOpen(false);
                        }}
                        className="py-2.5 px-3 flex-row justify-between items-center border-b border-slate-50 last:border-0"
                      >
                        <Text style={styles.dropdownItemText}>{s.split(' ')[0]}</Text>
                        {season === s && <Check size={12} color={FarmoraColors.primary} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </Card>
        </View>

        {/* Action button */}
        <TouchableOpacity
          onPress={handleRecommend}
          disabled={loading}
          style={{ backgroundColor: FarmoraColors.primary }}
          className="py-4 rounded-2xl items-center justify-center shadow-sm active:scale-[0.98] mt-6 mb-6"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
              Recommend Ideal Crop
            </Text>
          )}
        </TouchableOpacity>

        {/* Results Card */}
        {result && (
          <View className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-sm mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Sprout size={20} color={FarmoraColors.primary} />
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.primary }} className="uppercase tracking-wider">
                  Recommended Crop
                </Text>
              </View>
              <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '800', color: FarmoraColors.primary }}>
                  {result.suitability}% Match
                </Text>
              </View>
            </View>

            <Text style={{ fontFamily: 'Inter', fontSize: 24, fontWeight: '900', color: '#0F172A' }} className="mb-4">
              {result.crop}
            </Text>

            <View className="flex-row justify-between border-t border-b border-slate-100 py-3 mb-4">
              <View className="flex-1">
                <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '700', color: '#64748B' }} className="uppercase tracking-wider mb-1">
                  Expected Yield
                </Text>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: '#1E293B' }}>
                  {result.expectedYield}
                </Text>
              </View>
              <View className="w-px bg-slate-100 mx-2" />
              <View className="flex-1 pl-2">
                <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '700', color: '#64748B' }} className="uppercase tracking-wider mb-1">
                  Duration
                </Text>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: '#1E293B' }}>
                  {result.duration}
                </Text>
              </View>
            </View>

            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '800', color: '#475569' }} className="uppercase mb-1.5 tracking-wider">
              Sowing instructions
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#334155', lineHeight: 18 }} className="font-semibold">
              {result.instructions}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  climateLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#e8f0e4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#161d16',
  },
  dropdownTrigger: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderColor: '#e8f0e4',
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: '#161d16',
  },
  dropdownMenu: {
    top: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  dropdownItemText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  }
});
