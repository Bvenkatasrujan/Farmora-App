import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, Globe, Camera, User, MapPin, Compass, Check, ArrowRight, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import locationsData from '../../data/locations.json';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/languageStore';
import { authService } from '../../services/supabase';
import { FarmoraColors } from '../../constants/colors';
import { useTranslation } from '../../hooks/useTranslation';

const languagesList = [
  'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 
  'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'Urdu', 'Spanish', 
  'French', 'German'
];
const nameToCodeMap: Record<string, string> = {
  English: 'en',
  Hindi: 'hi',
  Telugu: 'te',
  Tamil: 'ta',
  Kannada: 'kn',
  Malayalam: 'ml',
  Marathi: 'mr',
  Gujarati: 'gu',
  Bengali: 'bn',
  Punjabi: 'pa',
  Urdu: 'ur',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
};
const phoneCodes = ['+91', '+1', '+44', '+61', '+81'];

export default function UserDetailsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setLanguage: setLangStoreLanguage } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const { 
    user, 
    profile, 
    setProfile, 
    language,
    setLanguage, 
    setLocation, 
    setLocationPermission, 
    setOnboardingCompleted,
    locationName: storeLocationName,
    latitude: storeLatitude,
    longitude: storeLongitude,
    isOnboardingCompleted
  } = useAppStore();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  
  // Parse phone number
  const getInitialPhone = () => {
    const rawPhone = profile?.phone_number || '';
    if (!rawPhone) return { code: '+91', number: '' };
    
    // If it contains space like "+91 9876543210" or "+91 98765 43210"
    if (rawPhone.includes(' ')) {
      const parts = rawPhone.split(' ');
      const code = parts[0];
      const number = parts.slice(1).join(' ');
      return { code, number };
    }
    
    // Otherwise check prefix
    for (const code of ['+91', '+1', '+44', '+61', '+81']) {
      if (rawPhone.startsWith(code)) {
        return { code, number: rawPhone.slice(code.length).trim() };
      }
    }
    
    return { code: '+91', number: rawPhone };
  };

  const initialPhoneData = getInitialPhone();
  const [phone, setPhone] = useState(initialPhoneData.number);
  const [phoneCode, setPhoneCode] = useState(initialPhoneData.code);
  const [selectedLang, setSelectedLang] = useState(profile?.language || language || 'English');
  const [avatar, setAvatar] = useState<string | null>(profile?.avatar_url || null);
  
  const [selectedState, setSelectedState] = useState<string | null>(profile?.state || null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(profile?.district || null);
  const [selectedMandal, setSelectedMandal] = useState<string | null>(profile?.mandal || null);

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isPhoneCodeOpen, setIsPhoneCodeOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('Permission Required'),
        t('Sorry, we need camera roll permissions to upload your profile photo.')
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        shadowQuality: 0.8,
      } as any);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err: any) {
      console.log('Error picking image:', err);
    }
  };

  // Extract list of states from locations hierarchy
  const states = React.useMemo(() => {
    if (!locationsData || !locationsData.states) return [];
    return locationsData.states.map((s) => s.name);
  }, []);

  // Compute districts dependent on state selection
  const districts = React.useMemo(() => {
    if (!selectedState || !locationsData || !locationsData.states) return [];
    const stateObj = locationsData.states.find((s) => s.name === selectedState);
    return stateObj ? stateObj.districts.map((d) => d.name) : [];
  }, [selectedState]);

  // Compute mandals dependent on district selection
  const mandals = React.useMemo(() => {
    if (!selectedState || !selectedDistrict || !locationsData || !locationsData.states) return [];
    const stateObj = locationsData.states.find((s) => s.name === selectedState);
    if (!stateObj) return [];
    const districtObj = stateObj.districts.find((d) => d.name === selectedDistrict);
    return districtObj ? districtObj.mandals.map((m) => m.name) : [];
  }, [selectedState, selectedDistrict]);

  // Handler for state dropdown selection changes
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedDistrict(null);
    setSelectedMandal(null);
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: '' }));
    }
  };

  // Handler for district dropdown selection changes
  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSelectedMandal(null);
    if (errors.district) {
      setErrors((prev) => ({ ...prev, district: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = t('Full Name is required');
    if (!phone.trim()) newErrors.phone = t('Phone number is required');
    else if (phone.trim().length < 8) newErrors.phone = t('Enter a valid phone number');
    
    if (!selectedState) newErrors.state = t('State is required');
    if (!selectedDistrict) newErrors.district = t('District is required');
    if (!selectedMandal) newErrors.mandal = t('Mandal is required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitLoading(true);
    const code = nameToCodeMap[selectedLang] || 'en';
    const resolvedLocName = selectedMandal ? `${selectedMandal}, ${selectedDistrict}, ${selectedState}` : '';

    const updatedProfile = {
      ...profile,
      id: user?.id || 'mock_user_123',
      email: user?.email || profile?.email || undefined,
      full_name: fullName,
      phone_number: `${phoneCode} ${phone}`,
      language: selectedLang,
      avatar_url: avatar || undefined,
      location_name: resolvedLocName,
      state: selectedState || undefined,
      district: selectedDistrict || undefined,
      mandal: selectedMandal || undefined,
      role: profile?.role || 'farmer',
    };

    try {
      setLangStoreLanguage(code);

      if (user?.id && !user.id.startsWith('mock_')) {
        await authService.upsertProfile(updatedProfile);
      }
      await setProfile(updatedProfile);
      setLanguage(selectedLang);
      setLocation(resolvedLocName, null, null);
      
      if (isOnboardingCompleted) {
        Alert.alert(t('Success') || 'Success', t('Profile updated successfully!') || 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await setOnboardingCompleted(true);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.log('Error saving profile, bypassing:', error.message);
      await setProfile(updatedProfile);
      setLanguage(selectedLang);
      setLangStoreLanguage(code);
      setLocation(resolvedLocName, null, null);
      
      if (isOnboardingCompleted) {
        Alert.alert(t('Success') || 'Success', t('Profile updated successfully!') || 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await setOnboardingCompleted(true);
        router.replace('/(tabs)');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
      style={{ backgroundColor: FarmoraColors.background, paddingTop: insets.top }}
    >
      {/* Header (only when editing post-onboarding) */}
      {isOnboardingCompleted && (
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/profile');
              }
            }} 
            className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:scale-95"
          >
            <ArrowLeft size={18} color="#1E293B" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: '#1E293B' }}>
            {t('edit_profile') || 'Edit Profile'}
          </Text>
          <View className="w-10" />
        </View>
      )}

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
        className="px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
          {/* Screen Title */}
          <View className="mb-6 items-center">
            <Text 
              style={{ fontFamily: 'Inter', fontSize: 26, fontWeight: '800', color: FarmoraColors.textDark }}
              className="mb-1 text-center"
            >
              {isOnboardingCompleted ? (t('edit_profile') || 'Edit Profile') : t('Complete your profile')}
            </Text>
            <Text 
              style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '500', color: FarmoraColors.textGray }}
              className="text-center px-4"
            >
              {isOnboardingCompleted 
                ? (t('edit_profile_desc') || 'Update your profile details and preference settings.')
                : t('Set up your details to get personalized local farming details.')}
            </Text>
          </View>

          {/* Profile Card Container */}
          <Card 
            className="p-6 mb-6"
            style={{
              borderRadius: 32,
              borderWidth: 1,
              borderColor: '#edf6ea',
            }}
          >
            {/* Avatar picker */}
            <View className="items-center mb-6">
              <TouchableOpacity
                onPress={pickImage}
                className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white justify-center items-center overflow-hidden relative"
                style={{
                  shadowColor: '#166534',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} className="w-full h-full animate-fade-in" />
                ) : (
                  <View className="items-center justify-center">
                    <User size={36} color="#94A3B8" />
                  </View>
                )}
                <View 
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-white items-center justify-center"
                  style={{ backgroundColor: FarmoraColors.primary }}
                >
                  <Camera size={14} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Full Name input */}
            <Input
              label={t('Full Name')}
              placeholder={t('e.g. Rajesh Kumar')}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              error={errors.fullName}
              icon={User}
            />

            {/* Phone with Country Code dropdown input */}
            <View className="mb-4 w-full">
              <Text 
                style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: '600',
                  lineHeight: 16,
                  letterSpacing: 0.6,
                  color: FarmoraColors.textDark,
                }}
                className="mb-1.5 ml-1 uppercase"
              >
                {t('Phone Number')}
              </Text>
              
              <View className="flex-row gap-2 relative">
                {/* Custom Phone Code Selector */}
                <TouchableOpacity
                  onPress={() => setIsPhoneCodeOpen(!isPhoneCodeOpen)}
                  className="flex-row items-center justify-center px-3 border"
                  style={{
                    width: 76,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: '#F8FAFC',
                    borderColor: errors.phone ? FarmoraColors.error : '#E2E8F0',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: FarmoraColors.textDark }}>
                    {phoneCode}
                  </Text>
                </TouchableOpacity>

                {/* Number field */}
                <View className="flex-1">
                  <Input
                    placeholder={t('98765 43210')}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    error={errors.phone}
                    icon={Phone}
                    keyboardType="phone-pad"
                    maxLength={15}
                    style={{ marginBottom: 0 }}
                  />
                </View>

                {/* Country Code dropdown menu overlay */}
                {isPhoneCodeOpen && (
                  <View 
                    className="absolute bg-white border border-slate-200 rounded-xl p-1 z-50"
                    style={{
                      top: 56,
                      left: 0,
                      width: 76,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    {phoneCodes.map((code) => (
                      <TouchableOpacity
                        key={code}
                        onPress={() => {
                          setPhoneCode(code);
                          setIsPhoneCodeOpen(false);
                        }}
                        className="py-2.5 items-center border-b border-slate-50 last:border-0"
                      >
                        <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: FarmoraColors.textDark }}>
                          {code}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* State selector */}
            <SearchableDropdown
              label="State"
              placeholder={t("Select State") || "Select State"}
              data={states}
              value={selectedState}
              onChange={handleStateChange}
              error={errors.state}
            />

            {/* District selector */}
            <SearchableDropdown
              label="District"
              placeholder={selectedState ? (t("Select District") || "Select District") : (t("First select State") || "First select State")}
              data={districts}
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedState}
              error={errors.district}
            />

            {/* Mandal selector */}
            <SearchableDropdown
              label="Mandal"
              placeholder={selectedDistrict ? (t("Select Mandal") || "Select Mandal") : (t("First select District") || "First select District")}
              data={mandals}
              value={selectedMandal}
              onChange={(value) => {
                setSelectedMandal(value);
                if (errors.mandal) {
                  setErrors((prev) => ({ ...prev, mandal: '' }));
                }
              }}
              disabled={!selectedDistrict}
              error={errors.mandal}
            />

            {/* Custom Dropdown for Preferred Language */}
            <View className="mb-6 w-full relative z-40">
              <Text 
                style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: '600',
                  lineHeight: 16,
                  letterSpacing: 0.6,
                  color: FarmoraColors.textDark,
                }}
                className="mb-1.5 ml-1 uppercase"
              >
                {t('Preferred Language')}
              </Text>

              <TouchableOpacity
                onPress={() => setIsLangOpen(!isLangOpen)}
                className="flex-row items-center justify-between px-4 border"
                style={{
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: '#F8FAFC',
                  borderColor: '#E2E8F0',
                }}
              >
                <View className="flex-row items-center">
                  <Globe size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                  <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: FarmoraColors.textDark }}>
                    {t(selectedLang)}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#94A3B8' }}>{isLangOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Language dropdown list overlay */}
              {isLangOpen && (
                <View 
                  className="absolute bg-white border border-slate-200 rounded-xl p-1 w-full"
                  style={{
                    top: 74,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                    {languagesList.map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => {
                          setSelectedLang(lang);
                          setIsLangOpen(false);
                        }}
                        className="py-3 px-4 flex-row justify-between items-center border-b border-slate-50 last:border-0"
                      >
                        <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: FarmoraColors.textDark }}>
                          {t(lang)}
                        </Text>
                        {selectedLang === lang && <Check size={14} color={FarmoraColors.primary} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>


            {/* Save & Continue / Save Changes */}
            <Button
              title={isOnboardingCompleted ? (t('Save Changes') || 'Save Changes') : t('Save & Continue')}
              onPress={handleSave}
              loading={submitLoading}
              variant="primary"
              showArrow={!isOnboardingCompleted}
              style={{ width: '100%', height: 52 }}
            />
          </Card>

        </ScrollView>
    </KeyboardAvoidingView>
  );
}
