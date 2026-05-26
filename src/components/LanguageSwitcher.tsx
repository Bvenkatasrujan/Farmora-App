import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Globe, Search, X, Check, ChevronRight } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import { useLanguageStore } from '../store/languageStore';
import { FarmoraColors } from '../constants/colors';
import { useTranslation } from '../hooks/useTranslation';

export const languages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
];

export const codeToNameMap: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  mr: 'Marathi',
  gu: 'Gujarati',
  bn: 'Bengali',
  pa: 'Punjabi',
  ur: 'Urdu',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};

export const nameToCodeMap: Record<string, string> = {
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

interface LanguageSwitcherProps {
  visible: boolean;
  onClose: () => void;
  triggerButton?: boolean;
}

export default function LanguageSwitcher({ visible, onClose, triggerButton = false }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const { language: appStoreLanguage, setLanguage: setAppStoreLanguage, profile, setProfile } = useAppStore();
  const { language: langStoreCode, setLanguage: setLangStoreLanguage } = useLanguageStore();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Translating app...');

  // Google Translate setup for Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // 1. Define translation init callback
      if (!(window as any).googleTranslateElementInit) {
        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              autoDisplay: false,
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
        };
      }

      // 2. Create target container & load Translate element script
      const SCRIPT_ID = 'google-translate-script';
      if (!document.getElementById(SCRIPT_ID)) {
        if (!document.getElementById('google_translate_element')) {
          const div = document.createElement('div');
          div.id = 'google_translate_element';
          div.style.display = 'none';
          document.body.appendChild(div);
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);
      }

      // 3. Read initial language cookie on load and sync store
      const cookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
      if (cookie) {
        const lang = cookie.split('/')[2];
        if (lang) {
          const langName = codeToNameMap[lang] || 'English';
          if (appStoreLanguage !== langName) {
            setAppStoreLanguage(langName);
            setLangStoreLanguage(lang);
          }
        }
      }
    }
  }, []);

  // Active selected language code
  const activeCode = nameToCodeMap[appStoreLanguage] || langStoreCode || 'en';

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageChange = async (langCode: string) => {
    setLoading(true);
    
    // Choose loading text based on selected language for premium touch
    const tempLoadingTexts: Record<string, string> = {
      en: 'Translating app...',
      hi: 'अनुवाद किया जा रहा है...',
      te: 'అనువదిస్తోంది...',
      ta: 'மொழிபெயர்க்கிறது...',
      kn: 'ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...',
      ml: 'വിവർത്തനം ചെയ്യുന്നു...',
      mr: 'भाषांतर करीत आहे...',
      gu: 'ભાષાંતર થઈ રહ્યું છે...',
      bn: 'অনুবাদ করা হচ্ছে...',
      pa: 'ਅਨੁਵਾਦ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
      ur: 'ترجمہ ہو رہا ہے...',
      es: 'Traduciendo aplicación...',
      fr: 'Traduction de l\'application...',
      de: 'App wird übersetzt...',
    };

    setLoadingText(tempLoadingTexts[langCode] || 'Translating app...');

    try {
      // 1. Set App Store Language Name
      const langName = codeToNameMap[langCode] || 'English';
      setAppStoreLanguage(langName);

      // 2. Set Language Store Code (Sync with i18n inside)
      setLangStoreLanguage(langCode);

      // 4. Update Supabase Profile if logged in
      if (profile && profile.id && !profile.id.startsWith('mock_')) {
        const updatedProfile = {
          ...profile,
          language: langName,
        };
        setProfile(updatedProfile);
      }

      // 5. Trigger Google Translate on Web
      if (Platform.OS === 'web') {
        // Set cookies
        document.cookie = `googtrans=/en/${langCode}; path=/`;
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;

        // Trigger hidden Translate select element
        const googleTranslateDropdown = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (googleTranslateDropdown) {
          googleTranslateDropdown.value = langCode;
          googleTranslateDropdown.dispatchEvent(new Event('change'));
        }

        // Force page reload to apply translate CSS rules immediately
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (err) {
      console.log('Error switching language:', err);
    } finally {
      setLoading(false);
      setIsOpen(false);
      onClose();
    }
  };

  const currentLangNative = languages.find((l) => l.code === activeCode)?.native || 'English';

  const renderModalContent = () => {
    if (!visible && !isOpen) return null;

    const ModalContainer = Platform.OS === 'web' ? View : Animated.View;
    const modalContainerProps = Platform.OS === 'web' 
      ? { style: [styles.modalContainer, { paddingBottom: 30, zIndex: 10000 }] }
      : { 
          style: [styles.modalContainer, { paddingBottom: 30, zIndex: 10000 }],
          entering: SlideInDown.springify().damping(18).mass(0.9),
          exiting: SlideOutDown.duration(200)
        };

    const modalBody = (
      <>
        {/* Backdrop click dismiss overlay */}
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => {
            if (!loading) {
              setIsOpen(false);
              onClose();
            }
          }}
        />

        {/* Modal Container */}
        <ModalContainer {...modalContainerProps as any}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.globeBox}>
                <Globe size={18} color="white" />
              </View>
              <Text style={styles.titleText}>{t('select_language')}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setIsOpen(false);
                onClose();
              }}
              style={styles.closeBtn}
              disabled={loading}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Search size={16} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              placeholder={t('search_crops') === 'Search for crops (e.g. Organic Wheat)' ? 'Search language...' : t('search_crops')}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Languages List */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
          >
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = activeCode === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleLanguageChange(lang.code)}
                    disabled={loading}
                    activeOpacity={0.7}
                    style={[
                      styles.langCard,
                      isSelected ? styles.langCardSelected : styles.langCardNormal
                    ]}
                  >
                    <View style={styles.langLeft}>
                      <Text style={styles.flagText}>{lang.flag}</Text>
                      <View style={styles.langNameBox}>
                        <Text style={[
                          styles.langNative,
                          isSelected ? styles.langNativeSelected : styles.langNativeNormal
                        ]}>
                          {lang.native}
                        </Text>
                        <Text style={styles.langEnglish}>{lang.name}</Text>
                      </View>
                    </View>

                    {isSelected ? (
                      <View style={styles.checkBubble}>
                        <Check size={14} color="white" strokeWidth={3} />
                      </View>
                    ) : (
                      <ChevronRight size={16} color="#94A3B8" />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.noResultsBox}>
                <Text style={styles.noResultsText}>{t('no_results') || 'No results found'}</Text>
              </View>
            )}
          </ScrollView>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={FarmoraColors.primary} />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          )}
        </ModalContainer>
      </>
    );

    if (Platform.OS === 'web') {
      return (
        <View style={[styles.backdrop, { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
          {modalBody}
        </View>
      );
    }

    return (
      <Modal
        transparent
        visible={visible || isOpen}
        animationType="none"
        onRequestClose={() => {
          if (!loading) {
            setIsOpen(false);
            onClose();
          }
        }}
      >
        <Animated.View 
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={styles.backdrop}
        >
          {modalBody}
        </Animated.View>
      </Modal>
    );
  };

  if (triggerButton) {
    return (
      <>
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          style={styles.triggerButton}
          activeOpacity={0.8}
        >
          <View style={styles.triggerLeft}>
            <Globe size={18} color={FarmoraColors.primary} />
            <Text style={styles.triggerText}>{currentLangNative}</Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        {renderModalContent()}
      </>
    );
  }

  return renderModalContent();
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Premium dark glassmorphic shade
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '100%',
    maxHeight: Platform.OS === 'web' ? 550 : '80%',
    height: Platform.OS === 'web' ? 550 : undefined,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 24,
    paddingHorizontal: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  globeBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: FarmoraColors.primary || '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#1E293B',
    fontSize: 14,
    fontFamily: 'Inter',
    height: '100%',
  },
  listContainer: {
    flex: Platform.OS === 'web' ? undefined : 1,
    height: Platform.OS === 'web' ? 380 : undefined,
    marginBottom: 10,
  },
  listContent: {
    gap: 10,
    paddingBottom: 20,
  },
  langCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  langCardNormal: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  langCardSelected: {
    backgroundColor: '#F0FDF4', // Eco pale green highlight
    borderColor: '#10B981',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flagText: {
    fontSize: 24,
  },
  langNameBox: {
    justifyContent: 'center',
  },
  langNative: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
  },
  langNativeNormal: {
    color: '#1E293B',
  },
  langNativeSelected: {
    color: '#065F46', // Emerald dark green
  },
  langEnglish: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  checkBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 100,
  },
  loadingText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },
  triggerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    width: '100%',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  triggerText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});
