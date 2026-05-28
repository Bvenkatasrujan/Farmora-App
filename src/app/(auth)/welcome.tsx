import React, { useEffect } from 'react';
import { View, Text, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { FarmoraColors } from '../../constants/colors';

import { useTranslation } from '../../hooks/useTranslation';
import { useAppStore } from '../../store/useAppStore';
import TranslatedText from '../../components/TranslatedText';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setHasStarted = useAppStore((s) => s.setHasStarted);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  // Floating animation values
  const logoY = useSharedValue(0);
  const imageY = useSharedValue(0);

  useEffect(() => {
    // Continuous floating motion loops
    logoY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
    imageY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1800 }),
        withTiming(0, { duration: 1800 })
      ),
      -1,
      true
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoY.value }],
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: imageY.value }],
  }));

  return (
    <LinearGradient
      colors={['#f3fcef', '#d4e7d4']} // Light mint cream to soft sage-green gradient matching Mockup 1
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1 justify-between px-6 py-8">
        
        {/* Top Floating Logo Card */}
        <Animated.View style={logoStyle} className="items-center mt-6">
          {/* Farmora Logo Image */}
          <View
            style={{
              width: 100,
              height: 100,
              marginBottom: 20,
              shadowColor: '#166534',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Image
              source={require('../../../assets/images/farmora-logo.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
          </View>
          
          <Text 
            style={{ fontFamily: 'Inter', fontSize: 36, fontWeight: '800', color: '#161d16' }}
            className="tracking-tight"
          >
            Farmora
          </Text>
          
          <Text 
            style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '600', color: '#4b554b' }}
            className="text-center mt-2 px-8 leading-6"
          >
            {t('welcome_subtitle')}
          </Text>
        </Animated.View>

        {/* Center Seedling Image Card */}
        <Animated.View style={imageStyle} className="items-center my-6">
          <View
            className="w-full"
            style={{
              borderRadius: 36,
              shadowColor: '#166534',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 8,
              backgroundColor: '#ffffff',
            }}
          >
            <Image
              source={require('../../../assets/images/seedlings_illustration.png')}
              className="w-full h-72"
              style={{ borderRadius: 36 }}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        {/* Bottom Button and Watermark */}
        <View className="mb-6">
          <Button
            title={t('get_started')}
            onPress={async () => {
              await setHasStarted(true);
              router.push('/(auth)/language');
            }}
            variant="primary"
            showArrow
            style={{ width: '100%', height: 56 }}
          />

          <View className="flex-row items-center justify-center mt-6">
            <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
            <TranslatedText 
              text="EMPOWERING 10K+ FARMERS"
              style={{
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: '600',
                letterSpacing: 0.8,
                color: FarmoraColors.textGray,
              }}
              className="uppercase"
            />
          </View>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}
