import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Key, ShieldCheck, Smartphone, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/supabase';
import { FarmoraColors } from '../constants/colors';

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAppStore();
  const userId = user?.id || 'guest';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [twoFactor, setTwoFactor] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [updatingPass, setUpdatingPass] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedBiometrics = await AsyncStorage.getItem(`security_biometrics_${userId}`);
        const storedTwoFactor = await AsyncStorage.getItem(`security_twoFactor_${userId}`);

        if (storedBiometrics !== null) {
          setBiometrics(storedBiometrics === 'true');
        } else {
          setBiometrics(true); // Default to true
        }

        if (storedTwoFactor !== null) {
          setTwoFactor(storedTwoFactor === 'true');
        } else {
          setTwoFactor(false); // Default to false
        }
      } catch (err) {
        console.error('Failed to load security preferences:', err);
      }
    };

    loadPreferences();
  }, [userId]);

  const handleToggleBiometrics = async (value: boolean) => {
    setBiometrics(value);
    try {
      await AsyncStorage.setItem(`security_biometrics_${userId}`, value ? 'true' : 'false');
    } catch (err) {
      console.error('Failed to save biometric setting:', err);
    }
  };

  const handleToggleTwoFactor = async (value: boolean) => {
    setTwoFactor(value);
    try {
      await AsyncStorage.setItem(`security_twoFactor_${userId}`, value ? 'true' : 'false');
    } catch (err) {
      console.error('Failed to save 2FA setting:', err);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You must be logged in to update your password.');
      return;
    }

    setUpdatingPass(true);

    try {
      if (userId.startsWith('mock_')) {
        // Simulate API call for mock user
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        // For real users, check current password first by signing in
        if (user.email) {
          try {
            await authService.signIn(user.email, oldPassword);
          } catch (err: any) {
            Alert.alert('Error', 'Incorrect current password. Please try again.');
            setUpdatingPass(false);
            return;
          }
        }
        // Update user password in Supabase
        await authService.updatePassword(newPassword);
      }

      Alert.alert('Success', 'Your password has been successfully updated.', [
        {
          text: 'OK',
          onPress: () => {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Password update failed:', error);
      Alert.alert('Error', error.message || 'Failed to update password. Please try again.');
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:scale-95"
        >
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: '#1E293B' }}>
          Security & Privacy
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Toggle settings */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
          <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#0F172A' }} className="mb-4">
            Security Preferences
          </Text>

          {/* Biometrics */}
          <View className="flex-row items-center justify-between py-3 border-b border-slate-50">
            <View className="flex-1 pr-4">
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                Biometric Identification
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 }}>
                Use FaceID/TouchID to unlock Farmora.
              </Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
              thumbColor={biometrics ? '#059669' : '#cbd5e1'}
            />
          </View>

          {/* 2FA */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-1 pr-4">
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                Two-Factor Auth (2FA)
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 }}>
                Confirm sign-ins with an OTP sent to your phone.
              </Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={handleToggleTwoFactor}
              trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
              thumbColor={twoFactor ? '#059669' : '#cbd5e1'}
            />
          </View>
        </View>

        {/* Change Password Form */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Key size={18} color={FarmoraColors.primary} />
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#0F172A' }}>
              Change Password
            </Text>
          </View>

          {/* Old password */}
          <View className="mb-4">
            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: '#475569' }} className="mb-1.5 uppercase">
              Current Password
            </Text>
            <TextInput
              secureTextEntry={!showPass}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-slate-800"
              style={{ fontFamily: 'Inter', fontSize: 13 }}
            />
          </View>

          {/* New password */}
          <View className="mb-4">
            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: '#475569' }} className="mb-1.5 uppercase">
              New Password
            </Text>
            <TextInput
              secureTextEntry={!showPass}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-slate-800"
              style={{ fontFamily: 'Inter', fontSize: 13 }}
            />
          </View>

          {/* Confirm password */}
          <View className="mb-5">
            <View className="flex-row justify-between items-center mb-1.5">
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: '#475569' }} className="uppercase">
                Confirm New Password
              </Text>
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: FarmoraColors.primary }}>
                  {showPass ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              secureTextEntry={!showPass}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-slate-800"
              style={{ fontFamily: 'Inter', fontSize: 13 }}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleUpdatePassword}
            disabled={updatingPass}
            className={`bg-emerald-600 py-3.5 rounded-2xl items-center justify-center active:scale-[0.98] ${
              updatingPass ? 'opacity-80' : ''
            }`}
          >
            {updatingPass ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                Update Password
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sessions details */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Smartphone size={18} color="#475569" />
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#0F172A' }}>
              Active Sessions
            </Text>
          </View>

          <View className="flex-row items-start gap-3 py-2">
            <View className="w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center border border-emerald-100">
              <ShieldCheck size={20} color={FarmoraColors.primary} />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                This Mobile Device
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 }}>
                Active Now • Karnal, India
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
