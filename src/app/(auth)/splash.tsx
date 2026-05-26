import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const logoY = useSharedValue(0);
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(20);

  useEffect(() => {
    // Entrance animation: scale + fade in logo
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 700 });

    // Slide text up and fade in shortly after
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600 });
      textY.value = withTiming(0, { duration: 600 });
    }, 400);

    // Start floating animation after entrance
    setTimeout(() => {
      logoY.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 1600 }),
          withTiming(0, { duration: 1600 })
        ),
        -1,
        true
      );
    }, 800);

    // Navigate after 2.8 seconds
    const timer = setTimeout(() => {
      router.replace('/(auth)/welcome');
    }, 2800);

    return () => clearTimeout(timer);
  }, [router, logoY, logoScale, logoOpacity, textOpacity, textY]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: logoY.value },
      { scale: logoScale.value },
    ],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  return (
    <LinearGradient
      colors={['#f0fdf4', '#dcfce7', '#bbf7d0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Decorative circles in background */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.centerContent}>
        {/* Animated Logo Image */}
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image
            source={require('../../../assets/images/farmora-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Breathing Text and Subtitle */}
        <Animated.View style={[styles.textGroup, textStyle]}>
          <Text style={styles.subtitle}>Smart Farming Starts Here</Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View style={[styles.footer, textStyle]}>
        <View style={styles.dot} />
        <Text style={styles.footerText}>GROWING WITH CARE</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
    bottom: -width * 0.1,
    left: -width * 0.15,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    // Premium drop shadow
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  textGroup: {
    alignItems: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#047857',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#10b981',
    borderRadius: 3,
    marginRight: 8,
  },
  footerText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#6d7b6c',
  },
});
