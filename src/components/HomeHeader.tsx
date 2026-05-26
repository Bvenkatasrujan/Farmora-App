import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { FarmoraColors } from '../constants/colors';
import { useRouter } from 'expo-router';

export const HomeHeader: React.FC = () => {
  const router = useRouter();
  const { profile, unreadNotificationsCount } = useAppStore();
  const insets = useSafeAreaInsets();

  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';

  return (
    <View 
      style={{ 
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderColor: '#f1f8ee',
        paddingHorizontal: 20,
        paddingTop: insets.top + 8,
        paddingBottom: 16,
      }}
      className="flex-row justify-between items-center"
    >
      {/* Left side: Avatar & Name */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/profile')}
          className="w-10 h-10 rounded-full border border-slate-100 justify-center items-center overflow-hidden active:scale-95"
        >
          <Image
            source={{ uri: avatarUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </TouchableOpacity>
        
        <Text 
          style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: '800', color: FarmoraColors.primary }}
          className="tracking-tight"
        >
          Farmora
        </Text>
      </View>

      {/* Right side: Notifications Icon */}
      <TouchableOpacity 
        onPress={() => router.push('/notifications')}
        className="w-10 h-10 justify-center items-center rounded-full active:scale-95"
      >
        <View style={{ position: 'relative' }}>
          <Bell size={24} color={FarmoraColors.primary} strokeWidth={2} />
          {unreadNotificationsCount > 0 && (
            <View 
              style={{ 
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: '#ef4444',
                width: 8,
                height: 8,
                borderRadius: 4,
                borderWidth: 1.5,
                borderColor: '#FFFFFF',
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
