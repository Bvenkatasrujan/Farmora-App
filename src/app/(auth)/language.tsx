import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Leaf, Search, Globe, Check, X } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/languageStore';
import { authService } from '../../services/supabase';
import { FarmoraColors } from '../../constants/colors';
import { useTranslation } from '../../hooks/useTranslation';

const languagesList = [
  { name: 'English', native: 'English', subtitle: 'Modern Agriculture, Rooted in Tech', flag: '🇬🇧', code: 'en' },
  { name: 'Hindi', native: 'हिन्दी', subtitle: 'अपनी भाषा में कृषि', flag: '🇮🇳', code: 'hi' },
  { name: 'Telugu', native: 'తెలుగు', subtitle: 'మీ భాషలో వ్యవసాయం', flag: '🇮🇳', code: 'te' },
  { name: 'Tamil', native: 'தமிழ்', subtitle: 'உங்கள் மொழியில் வேளாண்மை', flag: '🇮🇳', code: 'ta' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', subtitle: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೃಷಿ', flag: '🇮🇳', code: 'kn' },
  { name: 'Malayalam', native: 'മലയാളം', subtitle: 'നിങ്ങളുടെ ഭാഷയിൽ കൃഷി', flag: '🇮🇳', code: 'ml' },
  { name: 'Marathi', native: 'मराठी', subtitle: 'तुमच्या भाषेत शेती', flag: '🇮🇳', code: 'mr' },
  { name: 'Gujarati', native: 'ગુજરાતી', subtitle: 'તમારી ભાષામાં ખેતી', flag: '🇮🇳', code: 'gu' },
  { name: 'Bengali', native: 'বাংলা', subtitle: 'আপনার ভাষায় চাষাবাদ', flag: '🇮🇳', code: 'bn' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', subtitle: 'ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ ਖੇਤੀਬਾੜੀ', flag: '🇮🇳', code: 'pa' },
  { name: 'Urdu', native: 'اردو', subtitle: 'آپ کی زبان میں زراعت', flag: '🇮🇳', code: 'ur' },
  { name: 'Spanish', native: 'Español', subtitle: 'Agricultura en tu idioma', flag: '🇪🇸', code: 'es' },
  { name: 'French', native: 'Français', subtitle: 'L\'agriculture dans votre langue', flag: '🇫🇷', code: 'fr' },
  { name: 'German', native: 'Deutsch', subtitle: 'Landwirtschaft in Ihrer Sprache', flag: '🇩🇪', code: 'de' },
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

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fromProfile = params.from === 'profile';
  const insets = useSafeAreaInsets();

  const { user, profile, setLanguage, setProfile, setLanguageSelected } = useAppStore();
  const { t } = useTranslation();
  const { setLanguage: setLangStoreLanguage } = useLanguageStore();

  const [selectedLangName, setSelectedLangName] = useState(profile?.language || 'English');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Saving language...');

  const filteredLanguages = languagesList.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    setLoading(true);
    const code = nameToCodeMap[selectedLangName] || 'en';

    try {
      // 1. Set App Store Language Name
      setLanguage(selectedLangName);

      // 2. Set Language Store Code
      setLangStoreLanguage(code);

      // 3. Mark language as selected (persisted)
      await setLanguageSelected(true);
      
      const updatedProfile = {
        ...profile,
        id: user?.id || 'mock_user_123',
        email: user?.email || profile?.email || undefined,
        language: selectedLangName,
      };

      if (user?.id && !user.id.startsWith('mock_')) {
        await authService.upsertProfile(updatedProfile);
      }
      await setProfile(updatedProfile);

      // --- GOOGLE TRANSLATE FOR WEB ---
      if (Platform.OS === 'web') {
        // Set the Google Translate cookie
        document.cookie = `googtrans=/en/${code}; path=/`;
        document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;

        // Trigger change on Google's hidden dropdown combo box
        const googleTranslateDropdown = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (googleTranslateDropdown) {
          googleTranslateDropdown.value = code;
          googleTranslateDropdown.dispatchEvent(new Event('change'));
        }

        // Navigate first, then reload browser page
        if (fromProfile) {
          router.replace('/(tabs)/profile');
        } else {
          router.push('/(auth)/login');
        }

        setTimeout(() => {
          window.location.reload();
        }, 150);
        return;
      }

      if (fromProfile) {
        router.replace('/(tabs)/profile');
      } else {
        router.push('/(auth)/login');
      }
    } catch (error: any) {
      console.log('Error saving language selection, bypassing for demo:', error.message);
      
      if (Platform.OS === 'web') {
        // Safe fallback for web
        document.cookie = `googtrans=/en/${code}; path=/`;
        document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;

        if (fromProfile) {
          router.replace('/(tabs)/profile');
        } else {
          router.push('/(auth)/login');
        }

        setTimeout(() => {
          window.location.reload();
        }, 150);
        return;
      }

      if (fromProfile) {
        router.replace('/(tabs)/profile');
      } else {
        router.push('/(auth)/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View className="flex-1 px-6 py-6">
        {/* Header containing circular icon & title */}
        <View className="flex-row items-center justify-center mb-1 mt-4 gap-3">
          <View className="w-10 h-10 bg-emerald-600 rounded-full items-center justify-center shadow-sm shadow-emerald-700/20">
            <Leaf size={20} color="white" fill="white" />
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: '800', color: '#111827' }}>
            {t('select_language')}
          </Text>
        </View>

        <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#4B5563' }} className="text-center mb-5">
          {t('select_language_subtitle')}
        </Text>

        {/* Premium Search Bar */}
        <View className="flex-row items-center border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-2xl mb-4 shadow-sm shadow-slate-100">
          <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search language..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-slate-800 text-sm py-0"
            style={{ includeFontPadding: false, fontFamily: 'Inter' }}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable Language selection list */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="flex-1 mb-4"
        >
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map((lang) => {
              const isSelected = selectedLangName === lang.name;
              return (
                <TouchableOpacity
                  key={lang.name}
                  onPress={() => setSelectedLangName(lang.name)}
                  className={`flex-row justify-between items-center py-3.5 px-5 rounded-2xl border ${
                    isSelected
                      ? 'bg-emerald-50/40 border-emerald-600'
                      : 'bg-white border-slate-200'
                  } mb-3`}
                  activeOpacity={0.7}
                  style={{
                    shadowColor: '#166534',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isSelected ? 0.04 : 0.01,
                    shadowRadius: 3,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <Text className="text-2xl mr-4">{lang.flag}</Text>
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
                        {lang.native}
                      </Text>
                      <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '500', color: '#6B7280' }} className="mt-0.5">
                        {lang.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Radio Circle */}
                  <View 
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      isSelected ? 'border-emerald-600' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <View className="w-3.5 h-3.5 bg-emerald-600 rounded-full" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center py-10">
              <Text className="text-slate-400 font-semibold italic text-sm">No results found</Text>
            </View>
          )}
        </ScrollView>

        {/* Accept Button and Privacy footnote */}
        <View className="pb-2">
          <Button 
            title={t('accept')}
            onPress={handleSave} 
            loading={loading} 
            variant="primary"
            style={{ width: '100%', height: 52 }}
          />

          <Text style={{ fontFamily: 'Inter' }} className="text-slate-400 text-[11px] text-center mt-4 px-4 leading-4">
            {t('terms_and_privacy')}
          </Text>
        </View>
      </View>

      {/* Dynamic Pre-fetch Fullscreen Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={FarmoraColors.primary} />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 9999,
  },
  loadingText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
  },
});
