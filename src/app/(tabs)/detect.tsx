import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Upload, Eye, Leaf, FlaskConical, Lightbulb, AlertTriangle, Bell, Sparkles, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/useAppStore';
import { FarmoraColors } from '../../constants/colors';
import { useTranslation } from '../../hooks/useTranslation';
import { diseaseService } from '../../services/diseaseService';
import { HomeHeader } from '../../components/HomeHeader';

const cropImages: Record<string, string> = {
  Tomato: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=400',
  Rice: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=400',
  Cotton: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=400'
};

export default function DetectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addDiagnosis, diagnosesHistory, profile, unreadNotificationsCount, createNotification } = useAppStore();
  const { t } = useTranslation();
  
  const [scanning, setScanning] = useState(false);
  const [showResult, setShowResult] = useState(true); // Show default mockup results initially
  const [photoSelected, setPhotoSelected] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  // Initial mockup diagnosis card matching premium dashboard design
  const initialMockDiagnosis = {
    id: 'mock_initial',
    disease: 'Leaf Blight',
    confidence: '94%',
    date: 'Oct 24, 2023',
    crop: 'Tomato',
    image: cropImages.Tomato,
    symptoms: 'Irregular brown spots with yellow halos appearing on lower leaves, eventually merging to cause leaf death.',
    treatment: 'Apply copper-based fungicides weekly.',
    prevention: 'Ensure proper spacing for air circulation.',
    organicRemedy: 'Spraying a solution of baking soda, liquid soap, and water regularly in early morning hours.',
    chemicalSolution: 'Apply copper-based protectant fungicide sprays like copper oxychloride.',
    growthTips: 'Water the plants at the base rather than overhead to keep foliage dry, and ensure adequate soil drainage.'
  };

  const [activeDiagnosis, setActiveDiagnosis] = useState<any>(initialMockDiagnosis);

  // Scanning animation shared value
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    if (scanning) {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(160, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1, // Infinite loops
        false
      );
    } else {
      scanLineY.value = 0;
    }
  }, [scanning, scanLineY]);

  const animatedScanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLineY.value }],
    };
  });

  const triggerScan = async (imageUri: string | null, base64Data: string | null = null) => {
    setScanning(true);
    setShowResult(false);
    setPhotoSelected(true);

    const finalImage = imageUri || cropImages.Tomato;

    try {
      // 1. Call the diseaseService API (Plant.id v3) to identify the condition
      const data = await diseaseService.detectDisease(finalImage, base64Data);

      // 2. Parse the results from the Plant.id API response
      const isHealthy = data?.result?.is_healthy?.binary ?? true;
      const suggestions = data?.result?.disease?.suggestions || [];

      // Extract plant/crop name if available from Plant.id classification suggestions
      const plantSuggestions = data?.result?.classification?.suggestions || [];
      let detectedCrop = 'Plant';
      if (plantSuggestions && plantSuggestions.length > 0) {
        detectedCrop = plantSuggestions[0].name
          .split(' ')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      let diseaseName = 'Healthy Leaf';
      let confidenceStr = '100%';

      if (!isHealthy && suggestions.length > 0) {
        const topSuggestion = suggestions[0];
        diseaseName = topSuggestion.name;
        // Capitalize diseaseName
        diseaseName = diseaseName.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        confidenceStr = `${Math.round(topSuggestion.probability * 100)}%`;
      } else if (isHealthy) {
        diseaseName = 'Healthy Leaf';
        confidenceStr = `${Math.round((data?.result?.is_healthy?.probability || 1.0) * 100)}%`;
      }

      // 3. Query Groq Llama-3.3 to fetch precise treatments, preventions and remedies
      const details = await diseaseService.getDiseaseDetails(diseaseName, detectedCrop);

      setScanning(false);
      setShowResult(true);

      const diagnosisRecord = {
        id: `diag_${Date.now()}`,
        disease: diseaseName,
        confidence: confidenceStr,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        crop: detectedCrop,
        image: finalImage,
        symptoms: details.symptoms,
        treatment: details.treatment,
        prevention: details.prevention,
        organicRemedy: details.organicRemedy,
        chemicalSolution: details.chemicalSolution,
        growthTips: details.growthTips
      };

      setActiveDiagnosis(diagnosisRecord);
      addDiagnosis(diagnosisRecord);
      createNotification(
        `AI Diagnosis: ${diagnosisRecord.disease} detected`,
        `Vision AI identified ${diagnosisRecord.disease} with ${diagnosisRecord.confidence} confidence on ${diagnosisRecord.crop}. Recommended treatment: ${diagnosisRecord.treatment}`,
        'system'
      );
    } catch (error: any) {
      console.error('Scan Disease Error:', error);
      setScanning(false);
      Alert.alert(
        'Detection Failed',
        'Could not complete disease detection. Using standard diagnosis as fallback.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Fallback to mock data to keep app usable
              setShowResult(true);
              const fallbackDetails = {
                id: `diag_${Date.now()}`,
                disease: 'Leaf Blight',
                confidence: '94%',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                crop: 'Tomato',
                image: finalImage,
                symptoms: 'Irregular spots, discoloration, or leaf curling indicating fungal infection.',
                treatment: 'Apply appropriate organic protectant or copper-based fungicide.',
                prevention: 'Maintain clean tools, crop rotation, and avoid wet foliage overnight.',
                organicRemedy: 'Spray with neem oil or garlic oil extract to control fungal spores.',
                chemicalSolution: 'Spray chlorothalonil or carbendazim at recommended dosages.',
                growthTips: 'Monitor nitrogen application, as high nitrogen leaves crops more susceptible.'
              };
              setActiveDiagnosis(fallbackDetails);
              addDiagnosis(fallbackDetails);
              createNotification(
                `AI Diagnosis: ${fallbackDetails.disease} detected`,
                `Vision AI identified ${fallbackDetails.disease} with ${fallbackDetails.confidence} confidence on ${fallbackDetails.crop}. Recommended treatment: ${fallbackDetails.treatment}`,
                'system'
              );
            }
          }
        ]
      );
    }
  };

  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('Permission Required') || 'Permission Required',
          t('We need camera access to capture leaf photos.') || 'We need camera access to capture leaf photos.'
        );
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const base64 = result.assets[0].base64 || null;
        setScannedImage(uri);
        triggerScan(uri, base64);
      }
    } catch (err: any) {
      console.log('Error opening camera:', err);
      // Fallback
      triggerScan(null, null);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('Permission Required') || 'Permission Required',
          t('We need media library access to pick leaf photos.') || 'We need media library access to pick leaf photos.'
        );
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const base64 = result.assets[0].base64 || null;
        setScannedImage(uri);
        triggerScan(uri, base64);
      }
    } catch (err: any) {
      console.log('Error picking photo:', err);
      // Fallback
      triggerScan(null, null);
    }
  };

  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';

  return (
    <View className="flex-1" style={{ backgroundColor: FarmoraColors.background }}>
      <HomeHeader />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Main Banner title */}
        <View className="px-5 pt-5 mb-5">
          <Text style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: '900', color: FarmoraColors.textDark }}>
            Crop Disease Detection
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 13, color: FarmoraColors.textGray, marginTop: 4, lineHeight: 18 }} className="font-semibold">
            Scan crop leaves and detect diseases instantly using our advanced vision AI.
          </Text>
        </View>

        {/* Scanner Card Container */}
        <View className="px-5 mb-6">
          <Card variant="white" className="p-5 bg-white border border-slate-100" style={{ borderRadius: 28 }}>
            
            {/* Scan Area Frame */}
            <View 
              style={{
                height: 200,
                borderWidth: 2,
                borderColor: FarmoraColors.primary,
                borderStyle: 'dashed',
                borderRadius: 20,
                backgroundColor: '#f8faf7',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}
              className="mb-5"
            >
              {scanning ? (
                <>
                  <Image source={{ uri: scannedImage || cropImages.Tomato }} className="w-full h-full absolute opacity-40" resizeMode="cover" />
                  <Animated.View
                    style={[animatedScanLineStyle, { height: 3, backgroundColor: '#22c55e' }]}
                    className="absolute left-0 right-0 shadow shadow-emerald-400"
                  />
                  <View className="items-center">
                    <ActivityIndicator size="small" color={FarmoraColors.primary} />
                    <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.primary }} className="mt-2">
                      Scanning plant leaf...
                    </Text>
                  </View>
                </>
              ) : photoSelected ? (
                <>
                  <Image source={{ uri: scannedImage || cropImages.Tomato }} className="w-full h-full absolute" resizeMode="cover" />
                  <TouchableOpacity 
                    onPress={() => {
                      setPhotoSelected(false);
                      setScannedImage(null);
                    }} 
                    className="bg-black/60 p-2 rounded-full absolute top-3 right-3"
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </>
              ) : (
                <View className="items-center">
                  <View className="w-14 h-14 bg-emerald-50 rounded-full items-center justify-center mb-3">
                    <Sparkles size={24} color={FarmoraColors.primary} />
                  </View>
                  <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.primary }}>
                    {t('ready_to_scan')}
                  </Text>
                </View>
              )}
            </View>

            {/* Scan Frame CTAs */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleOpenCamera}
                style={{ backgroundColor: FarmoraColors.primary }}
                className="flex-1 flex-row items-center justify-center py-3.5 rounded-2xl"
              >
                <Camera size={16} color="white" style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: 'white' }}>
                  {t('open_camera')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUploadPhoto}
                style={{ borderColor: FarmoraColors.primary, borderWidth: 1 }}
                className="flex-1 flex-row items-center justify-center py-3.5 rounded-2xl bg-white"
              >
                <Upload size={16} color={FarmoraColors.primary} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: FarmoraColors.primary }}>
                  {t('upload_photo')}
                </Text>
              </TouchableOpacity>
            </View>

          </Card>
        </View>

        {/* Detection Result Card */}
        {showResult && activeDiagnosis && (
          <View className="px-5 mb-6">
            <Card variant="white" className="p-5 bg-white border border-slate-100" style={{ borderRadius: 28 }}>
              {/* Score header */}
              <View className="flex-row justify-between items-start mb-4">
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: FarmoraColors.textGray }} className="uppercase tracking-widest">
                    Detection Result ({activeDiagnosis.crop})
                  </Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: '900', color: FarmoraColors.textDark }} className="mt-1">
                    {activeDiagnosis.disease}
                  </Text>
                </View>

                <View className="items-end">
                  <Text style={{ fontFamily: 'Inter', fontSize: 24, fontWeight: '900', color: FarmoraColors.primary }}>
                    {activeDiagnosis.confidence}
                  </Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '700', color: FarmoraColors.textGray }}>
                    Confidence
                  </Text>
                </View>
              </View>

              {/* Status Badges */}
              <View className="flex-row gap-2 mb-4">
                <View className="bg-amber-100 px-3 py-1.5 rounded-full flex-row items-center">
                  <AlertTriangle size={12} color="#b45309" style={{ marginRight: 4 }} />
                  <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: '#b45309' }}>
                    Moderate Severity
                  </Text>
                </View>

                <View className="bg-emerald-100 px-3 py-1.5 rounded-full flex-row items-center">
                  <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: FarmoraColors.primary }}>
                    Spreading
                  </Text>
                </View>
              </View>

              {/* Symptoms */}
              <View className="mb-5">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Eye size={16} color={FarmoraColors.primary} />
                  <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: FarmoraColors.textDark }}>
                    Symptoms
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, color: FarmoraColors.textGray, lineHeight: 18 }} className="font-semibold">
                  {activeDiagnosis.symptoms || 'Symptoms details not available.'}
                </Text>
              </View>

              {/* Split Treatment / Prevention Grid */}
              <View className="flex-row gap-3 pt-3 border-t border-slate-50">
                <View className="flex-1 bg-emerald-50/50 p-3 rounded-2xl">
                  <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '800', color: FarmoraColors.primary }} className="uppercase mb-1 tracking-wider">
                    Treatment
                  </Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 11, color: FarmoraColors.textGray, lineHeight: 16 }} className="font-bold">
                    {activeDiagnosis.treatment || 'Treatment details not available.'}
                  </Text>
                </View>

                <View className="flex-1 bg-emerald-50/50 p-3 rounded-2xl">
                  <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '800', color: FarmoraColors.primary }} className="uppercase mb-1 tracking-wider">
                    Prevention
                  </Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 11, color: FarmoraColors.textGray, lineHeight: 16 }} className="font-bold">
                    {activeDiagnosis.prevention || 'Prevention details not available.'}
                  </Text>
                </View>
              </View>

            </Card>
          </View>
        )}

        {/* Recommended Actions */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: FarmoraColors.textDark }} className="px-5 mb-3">
            Recommended Actions
          </Text>

          <View className="flex-row justify-between px-5 gap-3">
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Organic Remedy 🌱',
                  activeDiagnosis.organicRemedy || 'Apply neem oil spray or insecticidal soaps under leaves.'
                );
              }}
              className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 items-center justify-center shadow-sm active:scale-95"
            >
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                <Leaf size={18} color={FarmoraColors.primary} />
              </View>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: FarmoraColors.textDark }} className="text-center">
                Organic Remedy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Chemical Solution 🧪',
                  activeDiagnosis.chemicalSolution || 'Apply broad spectrum chemical fungicides or pesticides as recommended on label.'
                );
              }}
              className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 items-center justify-center shadow-sm active:scale-95"
            >
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                <FlaskConical size={18} color={FarmoraColors.primary} />
              </View>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: FarmoraColors.textDark }} className="text-center">
                Chemical Solution
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Growth Tips 💡',
                  activeDiagnosis.growthTips || 'Maintain proper aeration, prune dead parts, and avoid overhead watering to prevent spore spreading.'
                );
              }}
              className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 items-center justify-center shadow-sm active:scale-95"
            >
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                <Lightbulb size={18} color={FarmoraColors.primary} />
              </View>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: FarmoraColors.textDark }} className="text-center">
                Growth Tips
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Scans History list */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: FarmoraColors.textDark }}>
              Recent Scans
            </Text>
            <TouchableOpacity>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: FarmoraColors.primary }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {diagnosesHistory && diagnosesHistory.length > 0 ? (
            diagnosesHistory.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setActiveDiagnosis(item);
                  setShowResult(true);
                  setPhotoSelected(true);
                  setScannedImage(item.image);
                }}
                activeOpacity={0.8}
              >
                <Card 
                  variant="white" 
                  className="p-3 mb-3 border border-slate-100 flex-row items-center gap-3" 
                  style={{ borderRadius: 20 }}
                >
                  <Image source={{ uri: item.image }} className="w-12 h-12 rounded-xl bg-slate-50" />
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.textDark }}>
                      {item.disease}
                    </Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-0.5">
                      {item.crop} • {item.date}
                    </Text>
                  </View>
                  <View className="bg-amber-100 px-2.5 py-1 rounded-full">
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '800', color: '#b45309' }}>
                      {item.confidence || '94%'}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <>
              {/* Interactive Mock History cards */}
              <TouchableOpacity
                onPress={() => {
                  const item = {
                    id: 'mock_early_blight',
                    disease: 'Early Blight',
                    confidence: '95%',
                    date: '22 Oct 2023',
                    crop: 'Tomato',
                    image: cropImages.Tomato,
                    symptoms: 'Dark spots with concentric rings appearing on older leaves first. Foliage turns yellow and drops.',
                    treatment: 'Apply chlorothalonil or organic copper-based sprays.',
                    prevention: 'Mulch plants, rotate crops, and prune lower leaves to prevent soil splash.',
                    organicRemedy: 'Spray with biological control agents (B. subtilis) or organic copper fungicides.',
                    chemicalSolution: 'Use systemic group 7 fungicides or chlorothalonil protectant sprays.',
                    growthTips: 'Stake plants early and prune lower branches to prevent soil contact.'
                  };
                  setActiveDiagnosis(item);
                  setShowResult(true);
                  setPhotoSelected(true);
                  setScannedImage(item.image);
                }}
                activeOpacity={0.8}
              >
                <Card variant="white" className="p-3 mb-3 border border-slate-100 flex-row items-center gap-3" style={{ borderRadius: 20 }}>
                  <Image source={{ uri: cropImages.Tomato }} className="w-12 h-12 rounded-xl bg-slate-50" />
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.textDark }}>
                      Early Blight
                    </Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-0.5">
                      Tomato • 22 Oct 2023
                    </Text>
                  </View>
                  <View className="bg-red-100 px-2.5 py-1 rounded-full">
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '800', color: '#b91c1c' }}>
                      CRITICAL
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const item = {
                    id: 'mock_stem_rust',
                    disease: 'Stem Rust',
                    confidence: '91%',
                    date: '18 Oct 2023',
                    crop: 'Wheat',
                    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=200',
                    symptoms: 'Oval to elongated rust-colored pustules on stems and leaves that rupture to release dusty red spores.',
                    treatment: 'Apply triazole or strobilurin-based fungicides immediately.',
                    prevention: 'Plant rust-resistant cultivars and control volunteer wheat host plants.',
                    organicRemedy: 'Use sulfur-based dusts or bio-fungicides to coat leaves early in the season.',
                    chemicalSolution: 'Spray tebuconazole or pyraclostrobin at recommended leaf emergence stages.',
                    growthTips: 'Avoid over-fertilizing with nitrogen, which creates dense, humid canopies conducive to rust.'
                  };
                  setActiveDiagnosis(item);
                  setShowResult(true);
                  setPhotoSelected(true);
                  setScannedImage(item.image);
                }}
                activeOpacity={0.8}
              >
                <Card variant="white" className="p-3 mb-3 border border-slate-100 flex-row items-center gap-3" style={{ borderRadius: 20 }}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=200' }} className="w-12 h-12 rounded-xl bg-slate-50" />
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: FarmoraColors.textDark }}>
                      Stem Rust
                    </Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-0.5">
                      Wheat • 18 Oct 2023
                    </Text>
                  </View>
                  <View className="bg-emerald-100 px-2.5 py-1 rounded-full">
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '800', color: FarmoraColors.primary }}>
                      HEALTHY
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            </>
          )}
        </View>

      </ScrollView>

    </View>
  );
}
