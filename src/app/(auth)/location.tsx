import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../store/useAppStore';
import { FarmoraColors } from '../../constants/colors';
import { useTranslation } from '../../hooks/useTranslation';
import { Bell } from 'lucide-react-native';
import { registerForNotificationsAsync } from '../../utils/notifications';

export default function PermissionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { setLocationPermission, setLocation, setPermissionsCompleted } = useAppStore();
  const [step, setStep] = useState<'location' | 'notification' | 'camera' | 'media'>('location');
  const [loading, setLoading] = useState(false);

  const handleLocationAllow = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const loc = await Location.getCurrentPositionAsync({});
        const coords = loc.coords;
        let locName = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
        try {
          const address = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          if (address && address.length > 0) {
            const first = address[0];
            const parts = [first.district || first.city, first.region].filter(Boolean);
            if (parts.length > 0) {
              locName = parts.join(', ');
            }
          }
        } catch (err) {
          console.log('Error reverse geocoding:', err);
        }
        setLocation(locName, coords.latitude, coords.longitude);
      } else {
        setLocationPermission(false);
        setLocation('', null, null);
      }
    } catch (error) {
      console.log('Location request error:', error);
      setLocationPermission(false);
      setLocation('', null, null);
    } finally {
      setLoading(false);
      setStep('notification');
    }
  };

  const handleLocationSkip = () => {
    setLocationPermission(false);
    setLocation('', null, null);
    setStep('notification');
  };

  const handleNotificationAllow = async () => {
    setLoading(true);
    try {
      await registerForNotificationsAsync();
    } catch (error) {
      console.log('Notification permission error:', error);
    } finally {
      setLoading(false);
      setStep('camera');
    }
  };

  const handleNotificationSkip = () => {
    setStep('camera');
  };

  const handleCameraAllow = async () => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        console.log('Camera permission granted');
      }
    } catch (error) {
      console.log('Camera permission error:', error);
    } finally {
      setLoading(false);
      setStep('media');
    }
  };

  const handleCameraSkip = () => {
    setStep('media');
  };

  const handleMediaAllow = async () => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        console.log('Media permission granted');
      }
    } catch (error) {
      console.log('Media permission error:', error);
    } finally {
      setLoading(false);
      setPermissionsCompleted(true);
      router.replace('/(auth)/user-details');
    }
  };

  const handleMediaSkip = () => {
    setPermissionsCompleted(true);
    router.replace('/(auth)/user-details');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {step === 'location' && (
        <View style={styles.content}>
          {/* Central Map Pin illustration */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/location_permission_illustration.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Heading and Description */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('allow_location')}</Text>
            <Text style={styles.subtitle}>
              {t('location_desc')}
            </Text>
          </View>

          {/* Bottom Row Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleLocationSkip} disabled={loading} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleLocationAllow} 
              disabled={loading}
              style={styles.allowButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.allowText}>{t('allow')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 'notification' && (
        <View style={styles.content}>
          {/* Central Notification illustration */}
          <View style={styles.imageContainer}>
            <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ecfdf5', borderRadius: 9999, width: 220, height: 220 }]}>
              <Bell size={110} color="#10B981" />
            </View>
          </View>

          {/* Heading and Description */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('allow_notifications') || 'Enable Notifications'}</Text>
            <Text style={styles.subtitle}>
              {t('notifications_desc') || 'Stay updated with live weather alerts, market price changes, and critical crop care reminders.'}
            </Text>
          </View>

          {/* Bottom Row Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleNotificationSkip} disabled={loading} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('skip') || 'Skip'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleNotificationAllow} 
              disabled={loading}
              style={[styles.allowButton, { backgroundColor: '#10B981' }]} 
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.allowText}>{t('allow') || 'Allow'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}


      {step === 'camera' && (
        <View style={styles.content}>
          {/* Central Camera illustration */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/camera_permission_illustration.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Heading and Description */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('allow_camera')}</Text>
            <Text style={styles.subtitle}>
              {t('camera_desc')}
            </Text>
          </View>

          {/* Bottom Row Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleCameraSkip} disabled={loading} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleCameraAllow} 
              disabled={loading}
              style={[styles.allowButton, { backgroundColor: FarmoraColors.primary }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.allowText}>{t('allow')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 'media' && (
        <View style={styles.content}>
          {/* Central Media/Gallery illustration */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/media_permission_illustration.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Heading and Description */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('allow_media')}</Text>
            <Text style={styles.subtitle}>
              {t('media_desc')}
            </Text>
          </View>

          {/* Bottom Row Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleMediaSkip} disabled={loading} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleMediaAllow} 
              disabled={loading}
              style={[styles.allowButton, { backgroundColor: '#4F46E5' }]} // Beautiful Indigo for gallery/media matching design
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.allowText}>{t('allow')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 24,
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 16,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  skipText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  allowButton: {
    backgroundColor: '#0256d6', // Blue color matching user mockup
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 9999,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  allowText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
}) as any;
