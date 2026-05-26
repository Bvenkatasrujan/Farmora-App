import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ImageBackground, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Globe, 
  MapPin, 
  User, 
  LogOut, 
  ChevronRight, 
  Info, 
  Shield, 
  Bell, 
  Pencil, 
  Sprout, 
  ShoppingBasket, 
  Cloud,
  Award,
  TrendingUp,
  Landmark
} from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/useAppStore';
import { FarmoraColors } from '../../constants/colors';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher, { languages } from '../../components/LanguageSwitcher';
import { HomeHeader } from '../../components/HomeHeader';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, language, locationName, logout, unreadNotificationsCount } = useAppStore();
  const { t, langCode } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLanguageName = languages.find(l => l.code === langCode)?.native || language;

  const handleLogout = () => {
    Alert.alert(
      t('sign_out') || 'Sign Out',
      'Are you sure you want to sign out from Farmora?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('sign_out') || 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200';
  const displayLocation = locationName || 'Karnal, Haryana';
  const displayName = profile?.full_name || 'Warren';

  return (
    <View className="flex-1" style={{ backgroundColor: FarmoraColors.background }}>
      <HomeHeader />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* User Bio Block */}
        <View className="items-center justify-center bg-white py-6 px-5 border-b border-slate-100/60 mb-6">
          <View className="relative mb-4">
            <View className="w-24 h-24 rounded-full bg-slate-50 border-4 border-emerald-100 justify-center items-center shadow-sm overflow-hidden">
              <Image
                source={{ uri: avatarUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/user-details')}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-600 border-2 border-white items-center justify-center shadow active:scale-90"
            >
              <Pencil size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: '900', color: FarmoraColors.textDark }}>
            {displayName}
          </Text>

          <View className="flex-row items-center mt-1.5 mb-3.5">
            <MapPin size={14} color={FarmoraColors.textGray} style={{ marginRight: 4 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: FarmoraColors.textGray }}>
              {displayLocation}
            </Text>
          </View>

          {/* Badges */}
          <View className="flex-row gap-2">
            <View className="bg-emerald-50 border border-emerald-100/70 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Sprout size={12} color={FarmoraColors.primary} />
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: FarmoraColors.primary }}>
                Active Farmer
              </Text>
            </View>
            <View className="bg-amber-50 border border-amber-100/70 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Award size={12} color="#d97706" />
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: '#d97706' }}>
                Gold Member
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5">
          {/* Farming Tools Section */}
          <View className="mb-6">
            <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '800', color: '#0F172A' }} className="mb-3">
              {t('farming_tools') || 'Farming Tools'}
            </Text>

            {/* Cover Card 1: Crop Recommendation */}
            <TouchableOpacity 
              onPress={() => router.push('/crop-recommendation')}
              className="mb-3 rounded-3xl overflow-hidden active:scale-[0.99]"
              activeOpacity={0.9}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1550147760-44c9966d6bc7?q=80&w=400' }}
                className="w-full h-[100px] justify-end"
              >
                <View className="absolute inset-0 bg-black/45" />
                <View className="flex-row items-center justify-between p-4 z-10">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-2xl bg-emerald-500/20 items-center justify-center border border-emerald-400/30">
                      <Sprout size={20} color="#34d399" />
                    </View>
                    <View>
                      <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                        Crop Recommendation
                      </Text>
                      <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#cbd5e1' }} className="mt-0.5">
                        Find best crops for your soil
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#FFFFFF" />
                </View>
              </ImageBackground>
            </TouchableOpacity>

            {/* Cover Card 2: Weather Report */}
            <TouchableOpacity 
              onPress={() => router.push('/weather-report')}
              className="mb-3 rounded-3xl overflow-hidden active:scale-[0.99]"
              activeOpacity={0.9}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400' }}
                className="w-full h-[100px] justify-end"
              >
                <View className="absolute inset-0 bg-black/45" />
                <View className="flex-row items-center justify-between p-4 z-10">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-2xl bg-cyan-500/20 items-center justify-center border border-cyan-400/30">
                      <Cloud size={20} color="#22d3ee" />
                    </View>
                    <View>
                      <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                        Weather Report
                      </Text>
                      <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#cbd5e1' }} className="mt-0.5">
                        7-day agro-weather forecast
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#FFFFFF" />
                </View>
              </ImageBackground>
            </TouchableOpacity>

            {/* Cover Card 3: Mandi Trends */}
            <TouchableOpacity 
              onPress={() => router.push('/market-trendings')}
              className="mb-3 rounded-3xl overflow-hidden active:scale-[0.99]"
              activeOpacity={0.9}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=400' }}
                className="w-full h-[100px] justify-end"
              >
                <View className="absolute inset-0 bg-black/45" />
                <View className="flex-row items-center justify-between p-4 z-10">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-2xl bg-sky-500/20 items-center justify-center border border-sky-400/30">
                      <TrendingUp size={20} color="#38bdf8" />
                    </View>
                    <View>
                      <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                        Mandi Trends
                      </Text>
                      <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#cbd5e1' }} className="mt-0.5">
                        Compare live market crop prices
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#FFFFFF" />
                </View>
              </ImageBackground>
            </TouchableOpacity>

            {/* Cover Card 4: Govt Schemes */}
            <TouchableOpacity 
              onPress={() => {
                Linking.openURL('https://www.myscheme.gov.in/search').catch(() => {
                  Alert.alert('Error', 'Unable to open link on this device.');
                });
              }}
              className="rounded-3xl overflow-hidden active:scale-[0.99]"
              activeOpacity={0.9}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400' }}
                className="w-full h-[100px] justify-end"
              >
                <View className="absolute inset-0 bg-black/45" />
                <View className="flex-row items-center justify-between p-4 z-10">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-2xl bg-amber-500/20 items-center justify-center border border-amber-400/30">
                      <Landmark size={20} color="#fbbf24" />
                    </View>
                    <View>
                      <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                        Govt Schemes
                      </Text>
                      <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#cbd5e1' }} className="mt-0.5">
                        Explore benefits and subsidies
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#FFFFFF" />
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* App Settings Section */}
          <View className="mb-6">
            <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '800', color: '#0F172A' }} className="mb-3">
              {t('settings') || 'App Settings'}
            </Text>

            <Card variant="white" className="p-2 border border-slate-100/60 mb-0" style={{ borderRadius: 24 }}>
              {/* Language */}
              <TouchableOpacity
                onPress={() => setLangModalVisible(true)}
                className="flex-row justify-between items-center py-3.5 px-4 active:bg-slate-50 border-b border-slate-50"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className="w-8 h-8 rounded-xl bg-sky-50 items-center justify-center mr-3">
                    <Globe size={16} color="#0284c7" />
                  </View>
                  <Text className="text-slate-800 text-sm font-bold flex-1">{t('app_language') || 'App Language'}</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-slate-400 text-xs font-bold">{currentLanguageName}</Text>
                  <ChevronRight size={14} color="#94A3B8" />
                </View>
              </TouchableOpacity>

              {/* Edit details */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/user-details')}
                className="flex-row justify-between items-center py-3.5 px-4 active:bg-slate-50 border-b border-slate-50"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center mr-3">
                    <User size={16} color={FarmoraColors.primary} />
                  </View>
                  <Text className="text-slate-800 text-sm font-bold flex-1">{t('update_profile') || 'Update Profile Details'}</Text>
                </View>
                <ChevronRight size={14} color="#94A3B8" />
              </TouchableOpacity>

              {/* Security */}
              <TouchableOpacity
                onPress={() => router.push('/security')}
                className="flex-row justify-between items-center py-3.5 px-4 active:bg-slate-50 border-b border-slate-50"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className="w-8 h-8 rounded-xl bg-indigo-50 items-center justify-center mr-3">
                    <Shield size={16} color="#4f46e5" />
                  </View>
                  <Text className="text-slate-800 text-sm font-bold flex-1">{t('security_settings') || 'Security Settings'}</Text>
                </View>
                <ChevronRight size={14} color="#94A3B8" />
              </TouchableOpacity>

              {/* Terms */}
              <TouchableOpacity
                onPress={() => router.push('/terms')}
                className="flex-row justify-between items-center py-3.5 px-4 active:bg-slate-50"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className="w-8 h-8 rounded-xl bg-slate-50 items-center justify-center mr-3">
                    <Info size={16} color="#475569" />
                  </View>
                  <Text className="text-slate-800 text-sm font-bold flex-1">{t('terms_of_service') || 'Terms of Service'}</Text>
                </View>
                <ChevronRight size={14} color="#94A3B8" />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Help Center & Support Banner */}
          <Card 
            variant="white"
            style={{ borderRadius: 24, backgroundColor: FarmoraColors.primary, borderColor: FarmoraColors.primary }}
            className="p-5 mb-8 shadow-sm"
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '800', color: '#FFFFFF' }} className="mb-1">
              {t('need_expert_advice') || 'Need Expert Advice?'}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#e6f4ea', lineHeight: 18 }} className="mb-4">
              {t('need_expert_advice_desc') || 'Need help with crops, weather reports, or markets? Connect with our agricultural advisors now.'}
            </Text>
            
            <TouchableOpacity 
              onPress={() => router.push('/support')}
              className="bg-white py-2.5 px-5 rounded-xl self-start active:scale-95"
            >
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.primary }}>
                {t('get_support') || 'Get Support'}
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Logout Section */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-center py-4 bg-red-50 border border-red-100 rounded-3xl active:bg-red-100/50"
          >
            <LogOut size={16} color="#dc2626" style={{ marginRight: 8 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#dc2626' }}>
              {t('sign_out') || 'Log Out of Farmora'}
            </Text>
          </TouchableOpacity>

          {/* Watermark Details */}
          <View className="mt-8 items-center justify-center">
            <Text className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
              Farmora v1.0.0
            </Text>
            <Text className="text-slate-400 text-[9px] font-semibold mt-0.5">
              © 2026 Farmora AgriTech Systems
            </Text>
          </View>
        </View>
      </ScrollView>
      <LanguageSwitcher visible={langModalVisible} onClose={() => setLangModalVisible(false)} />
    </View>
  );
}
