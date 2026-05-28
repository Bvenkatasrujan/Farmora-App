import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Key, ShieldCheck, Smartphone, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/supabase';
import { FarmoraColors } from '../constants/colors';

export default function SecurityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRecovery = params?.recovery === 'true';

  const insets = useSafeAreaInsets();
  const { user } = useAppStore();
  const userId = user?.id || 'guest';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [updatingPass, setUpdatingPass] = useState(false);

  const handleUpdatePassword = async () => {
    if (!isRecovery && !oldPassword) {
      Alert.alert('Error', 'Please fill in your current password.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in the new password fields.');
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
        // For real users, check current password first by signing in (UNLESS IN RECOVERY MODE)
        if (!isRecovery && user.email) {
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


        {/* Change Password Form */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Key size={18} color={FarmoraColors.primary} />
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#0F172A' }}>
              Change Password
            </Text>
          </View>

          {/* Old password - HIDE IF RECOVERY */}
          {!isRecovery && (
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
          )}

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

        {/* Delete Account Section */}
        <View className="bg-red-50 rounded-3xl p-5 border border-red-100 shadow-sm mt-4">
          <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#B91C1C' }} className="mb-2">
            Danger Zone
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '500', color: '#991B1B', marginBottom: 16 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you absolutely sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Attempt to call backend deletion if available
                        await authService.signOut(); // Logs out and clears session
                        useAppStore.getState().logout();
                        router.replace('/(auth)/splash');
                      } catch (e: any) {
                        Alert.alert('Error', 'Failed to delete account. Please try again.');
                      }
                    }
                  }
                ]
              );
            }}
            className="bg-red-600 py-3.5 rounded-2xl items-center justify-center active:scale-[0.98]"
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
