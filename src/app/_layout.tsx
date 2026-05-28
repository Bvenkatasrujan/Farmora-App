import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StatusBar, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import * as SplashScreen from 'expo-splash-screen';
import { Leaf } from 'lucide-react-native';
import '../global.css';
import { useLanguageStore } from '../store/languageStore';
import { GlobalChatbot } from '../components/GlobalChatbot';
import { 
  registerForNotificationsAsync,
  registerForPushNotifications,
  savePushTokenToSupabase,
  addNotificationResponseListener
} from '../utils/notifications';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';

SplashScreen.preventAutoHideAsync();

let pendingRecovery = false;

export default function RootLayout() {
  // Use individual selectors to avoid unnecessary re-renders
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);
  const isOnboardingCompleted = useAppStore((s) => s.isOnboardingCompleted);
  const initSession = useAppStore((s) => s.initSession);
  const hasStarted = useAppStore((s) => s.hasStarted);
  const language_selected = useAppStore((s) => s.language_selected);
  const language = useAppStore((s) => s.language);
  const permissions_completed = useAppStore((s) => s.permissions_completed);
  
  const router = useRouter();
  const segments = useSegments();
  const [appReady, setAppReady] = useState(false);

  // Load Google Translate widget script on Web globally
  useEffect(() => {
    if (Platform.OS === 'web') {
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
    }
  }, []);

  // Sync store language with useLanguageStore configuration bidirectionally
  useEffect(() => {
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
    const codeToNameMap: Record<string, string> = {
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

    // 1. Initial mount sync from persisted useLanguageStore
    const savedCode = useLanguageStore.getState().language || 'en';
    const expectedName = codeToNameMap[savedCode] || 'English';
    const currentName = useAppStore.getState().language;

    if (currentName !== expectedName) {
      useAppStore.getState().setLanguage(expectedName);
      return;
    }

    // 2. Ongoing sync to useLanguageStore when useAppStore updates
    const code = nameToCodeMap[language] || 'en';
    if (useLanguageStore.getState().language !== code) {
      useLanguageStore.getState().setLanguage(code);
    }
  }, [language]);


  // Initialize session - only run once
  useEffect(() => {
    initSession().then(() => {
      setAppReady(true);
      SplashScreen.hideAsync().catch(() => {});
      registerForNotificationsAsync();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle deep links for Supabase Password Recovery
  useEffect(() => {
    const handleDeepLink = async (event: Linking.EventType) => {
      const url = event.url;
      if (!url) return;
      if (url.includes('access_token=') && url.includes('refresh_token=')) {
        // Parse Hash parameters since Expo Linking might not parse hash accurately
        const hashStr = url.split('#')[1] || url.split('?')[1];
        if (hashStr) {
          const hashParams = hashStr.split('&').reduce((acc, current) => {
            const [key, value] = current.split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          const accessToken = hashParams.access_token;
          const refreshToken = hashParams.refresh_token;
          const type = hashParams.type;

          if (accessToken && refreshToken && type === 'recovery') {
            try {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (!error) {
                pendingRecovery = true;
                // If app is already ready, navigate immediately
                // The appReady check requires accessing the latest state, but we'll let the routing useEffect catch it if it's not ready yet.
                // We'll just set the flag. The routing useEffect will pick it up when appReady becomes true or segments change.
              }
            } catch (err) {
              console.error('Failed to set deep link session:', err);
            }
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url } as Linking.EventType);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  // Register push notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !user.id?.startsWith('mock_')) {
      const setupPushNotifications = async () => {
        try {
          const hasPermission = await registerForNotificationsAsync();
          if (hasPermission) {
            const token = await registerForPushNotifications();
            if (token) {
              await savePushTokenToSupabase(token, user.id);
            }
          }
        } catch (error) {
          console.warn('[PushNotifications] Failed to setup push notifications:', error);
        }
      };
      setupPushNotifications();
    }
  }, [isAuthenticated, user]);

  // Listen for notification clicks and perform screen redirection
  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const data = response?.notification?.request?.content?.data;
      if (data?.screen) {
        try {
          router.push(data.screen);
        } catch (err) {
          console.error('[Notifications] Routing failed for screen:', data.screen, err);
        }
      }
    });
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [router]);

  // Handle routing based on authentication & onboarding status
  useEffect(() => {
    if (!appReady) return;

    if (pendingRecovery) {
      pendingRecovery = false;
      router.push({ pathname: '/security', params: { recovery: 'true' } });
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // 1. Auth Flow (if not authenticated)
    if (!isAuthenticated) {
      if (!hasStarted) {
        if (segments[0] !== '(auth)' || (segments[1] !== 'splash' && segments[1] !== 'welcome')) {
          router.replace('/(auth)/splash');
        }
      } else if (!language_selected) {
        if (segments[0] !== '(auth)' || segments[1] !== 'language') {
          router.replace('/(auth)/language');
        }
      } else {
        // hasStarted is true and language is selected -> route to login or signup
        const allowedAuthScreens = ['login', 'signup'];
        const currentAuthScreen = segments[1] || '';
        if (!inAuthGroup || !allowedAuthScreens.includes(currentAuthScreen)) {
          router.replace('/(auth)/login');
        }
      }
      return;
    } 
    // 2. Permissions Flow (if authenticated but permissions incomplete)
    else if (!permissions_completed) {
      if (segments[0] !== '(auth)' || segments[1] !== 'location') {
        router.replace('/(auth)/location');
      }
    }
    // 3. Onboarding Flow (if authenticated and permissions complete, but onboarding is incomplete)
    else if (!isOnboardingCompleted) {
      if (segments[0] !== '(auth)' || segments[1] !== 'user-details') {
        router.replace('/(auth)/user-details');
      }
    } 
    // 4. Completed onboarding -> Main App Tabs
    else {
      if (inAuthGroup) {
        const currentScreen = segments[1] || '';
        if (currentScreen !== 'user-details' && currentScreen !== 'location') {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, isOnboardingCompleted, permissions_completed, appReady, hasStarted, language_selected, segments]);

  // Loading indicator for splash screen
  if (!appReady) {
    return (
      <View style={splashStyles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={splashStyles.inner}>
          <View style={splashStyles.iconBox}>
            <Leaf size={48} color="white" />
          </View>
          <Text style={splashStyles.title}>FARMORA</Text>
          <Text style={splashStyles.subtitle}>Smart Farming Starts Here</Text>
          <View style={{ paddingTop: 40 }}>
            <ActivityIndicator size="small" color="#10B981" />
          </View>
        </View>
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';
  const showChatFAB = isAuthenticated && isOnboardingCompleted && appReady && !inAuthGroup;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="seller-details" options={{ presentation: 'modal' }} />
        <Stack.Screen name="products" />
        <Stack.Screen name="crop-recommendation" options={{ presentation: 'modal' }} />
        <Stack.Screen name="weather-report" options={{ presentation: 'modal' }} />
        <Stack.Screen name="market-trendings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="security" options={{ presentation: 'modal' }} />
        <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
        <Stack.Screen name="support" options={{ presentation: 'modal' }} />
        <Stack.Screen name="updates-schemes" />
        <Stack.Screen name="notifications" />
      </Stack>

      {showChatFAB && <GlobalChatbot />}
    </>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 96,
    height: 96,
    backgroundColor: '#10B981',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
