import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  CloudRain, 
  Trash2, 
  Sparkles,
  Check
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';
import { databaseService } from '../services/supabase';
import { FarmoraColors } from '../constants/colors';
import { Card } from '../components/ui/Card';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  category: 'alerts' | 'schemes' | 'system';
  unread: boolean;
  iconName: 'rain' | 'warning' | 'price' | 'ai' | 'info';
  routePath?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_rain',
    title: 'Heavy Rain Warning',
    body: 'Expect 40mm heavy rain in the next 24 hours. Plan outdoor activities and crop spraying accordingly.',
    time: 'now',
    category: 'alerts',
    unread: true,
    iconName: 'rain',
    routePath: '/weather-report'
  },
  {
    id: 'notif_pm_kisan',
    title: 'PM-KISAN Deadline approaching',
    body: 'The registration deadline for the 15th Installment ends in 2 days. Complete your application now.',
    time: '2h ago',
    category: 'schemes',
    unread: true,
    iconName: 'warning',
    routePath: '/updates-schemes'
  },
  {
    id: 'notif_price',
    title: 'Wheat Price Update',
    body: 'Wheat prices increased by 4% in your local mandi this morning. Tap to view wholesale buyers.',
    time: '5h ago',
    category: 'system',
    unread: true,
    iconName: 'price',
    routePath: '/(tabs)/find-buyers'
  },
  {
    id: 'notif_ai',
    title: 'AI Crop Recommendation',
    body: 'AI suggests watering your crops early morning tomorrow due to low soil moisture (82%) and rising temperatures.',
    time: '1d ago',
    category: 'system',
    unread: false,
    iconName: 'ai',
    routePath: '/(tabs)/calendar'
  },
  {
    id: 'notif_solar',
    title: 'Solar Pump Subsidy Approved',
    body: 'You are eligible to apply for a 60% government subsidy on high-efficiency solar water pumps.',
    time: '2d ago',
    category: 'schemes',
    unread: false,
    iconName: 'info',
    routePath: '/updates-schemes'
  }
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUnreadNotificationsCount } = useAppStore();
  const userId = user?.id || 'guest';

  const [activeFilter, setActiveFilter] = useState<'All' | 'Alerts' | 'Schemes' | 'System'>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // Load notifications from Supabase / AsyncStorage
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoadingNotifs(true);
        let loadedList: NotificationItem[] = [];

        // 1. Try to load from Supabase if real user
        if (user && !user.id?.startsWith('mock_')) {
          const dbData = await databaseService.getNotifications(user.id);
          if (dbData && dbData.length > 0) {
            loadedList = dbData.map((item: any) => ({
              id: item.id,
              title: item.title,
              body: item.body,
              time: new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
              category: (item.type || 'system') as any,
              unread: !item.is_read,
              iconName: (item.type === 'alerts' ? 'rain' : item.type === 'schemes' ? 'warning' : 'ai') as any,
              routePath: item.type === 'alerts' ? '/weather-report' : item.type === 'schemes' ? '/updates-schemes' : '/(tabs)/calendar'
            }));
          }
        }

        // 2. Fallback to AsyncStorage if empty or offline/mock
        if (loadedList.length === 0) {
          const cachedString = await AsyncStorage.getItem(`notifications_list_${userId}`);
          if (cachedString) {
            loadedList = JSON.parse(cachedString);
          } else {
            // Seed with defaults
            loadedList = DEFAULT_NOTIFICATIONS;
            await AsyncStorage.setItem(`notifications_list_${userId}`, JSON.stringify(DEFAULT_NOTIFICATIONS));
            
            // Seed Supabase if real user and replace local IDs with DB UUIDs
            if (user && !user.id?.startsWith('mock_')) {
              try {
                const seeded: NotificationItem[] = [];
                for (const notif of DEFAULT_NOTIFICATIONS) {
                  const dbRow = await databaseService.addNotification(user.id, {
                    title: notif.title,
                    body: notif.body,
                    type: notif.category
                  });
                  // dbRow has a real UUID — use it so markRead works later
                  seeded.push({ ...notif, id: dbRow?.id ?? notif.id });
                }
                // Replace fallback IDs with real UUIDs in local list
                loadedList = seeded;
                await AsyncStorage.setItem(`notifications_list_${userId}`, JSON.stringify(seeded));
              } catch (dbErr) {
                console.warn('Failed to seed notifications to Supabase on mount:', dbErr);
              }
            }
          }
        }

        setNotifications(loadedList);
        setUnreadNotificationsCount(loadedList.filter(n => n.unread).length);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setNotifications(DEFAULT_NOTIFICATIONS);
        setUnreadNotificationsCount(DEFAULT_NOTIFICATIONS.filter(n => n.unread).length);
      } finally {
        setLoadingNotifs(false);
      }
    };

    loadNotifications();
  }, [userId, user]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    setUnreadNotificationsCount(0);
    try {
      await AsyncStorage.setItem(`notifications_list_${userId}`, JSON.stringify(updated));
      if (user && !user.id?.startsWith('mock_')) {
        await databaseService.markAllNotificationsRead(user.id);
      }
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
    Alert.alert('Success', 'All notifications marked as read.');
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive', 
          onPress: async () => {
            setNotifications([]);
            setUnreadNotificationsCount(0);
            try {
              await AsyncStorage.setItem(`notifications_list_${userId}`, JSON.stringify([]));
              if (user && !user.id?.startsWith('mock_')) {
                await databaseService.clearAllNotifications(user.id);
              }
            } catch (err) {
              console.error('Failed to clear notifications:', err);
            }
          } 
        }
      ]
    );
  };

  const handlePressNotification = async (notif: NotificationItem) => {
    // Mark as read
    const updated = notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n);
    setNotifications(updated);
    setUnreadNotificationsCount(updated.filter(n => n.unread).length);
    try {
      await AsyncStorage.setItem(`notifications_list_${userId}`, JSON.stringify(updated));
      if (user && !user.id?.startsWith('mock_')) {
        await databaseService.markNotificationRead(notif.id);
      }
    } catch (err) {
      console.error('Failed to mark single notification read:', err);
    }

    // Route
    if (notif.routePath) {
      if (notif.routePath.startsWith('/(tabs)')) {
        router.replace(notif.routePath as any);
      } else {
        router.push(notif.routePath as any);
      }
    } else {
      Alert.alert(notif.title, notif.body);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Alerts') return n.category === 'alerts';
    if (activeFilter === 'Schemes') return n.category === 'schemes';
    if (activeFilter === 'System') return n.category === 'system';
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: FarmoraColors.background }}>
      {/* Header */}
      <View 
        style={{ 
          paddingTop: insets.top + 8,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#f1f8ee',
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ 
              width: 38, 
              height: 38, 
              borderRadius: 19, 
              backgroundColor: '#f8faf7', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#e8f0e4'
            }}
          >
            <ArrowLeft size={20} color={FarmoraColors.textDark} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: '800', color: FarmoraColors.textDark }}>
              Notifications
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: FarmoraColors.textGray, marginTop: 1 }}>
              Updates, warnings, and government benefits
            </Text>
          </View>
        </View>

      </View>

      {/* Dynamic Actions Row */}
      {notifications.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14 }}>
          <TouchableOpacity 
            onPress={handleMarkAllRead}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Check size={14} color={FarmoraColors.primary} strokeWidth={2.5} />
            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '800', color: FarmoraColors.primary }}>
              Mark all read
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleClearAll}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Trash2 size={13} color="#ef4444" />
            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '800', color: '#ef4444' }}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Summary Banner Card */}
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <View
            style={{
              backgroundColor: '#edf6ea',
              borderColor: 'rgba(0, 110, 47, 0.12)',
              borderWidth: 1,
              borderRadius: 20,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#166534',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1
              }}
            >
              <Bell size={14} color={FarmoraColors.primary} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: '800',
                  color: FarmoraColors.primary,
                }}
              >
                You have {unreadCount} unread update{unreadCount > 1 ? 's' : ''}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: '600',
                  color: FarmoraColors.textGray,
                  marginTop: 1,
                }}
              >
                Tap on updates to view details and take actions.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {(['All', 'Alerts', 'Schemes', 'System'] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={{
                    backgroundColor: isActive ? FarmoraColors.primary : '#FFFFFF',
                    borderColor: isActive ? FarmoraColors.primary : '#e8f0e4',
                    borderWidth: 1,
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 8
                  }}
                >
                  <Text 
                    style={{ 
                      fontFamily: 'Inter', 
                      fontSize: 12, 
                      fontWeight: isActive ? '800' : '600', 
                      color: isActive ? '#FFFFFF' : FarmoraColors.textGray 
                    }}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Notifications Body */}
      {loadingNotifs ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={FarmoraColors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={{ flex: 1, marginTop: 16 }}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 30) }}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.length > 0 ? (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {filteredNotifications.map((notif) => {
              // High-fidelity icon configuration and category labels
              let iconElement = <AlertTriangle size={18} color="#ba1a1a" />;
              let iconBgColor = 'rgba(186, 26, 26, 0.08)';
              let categoryLabel = 'ALERT';
              let labelBg = 'rgba(186, 26, 26, 0.08)';
              let labelText = '#ba1a1a';
              
              if (notif.iconName === 'rain') {
                iconElement = <CloudRain size={18} color="#ba1a1a" />;
                iconBgColor = 'rgba(186, 26, 26, 0.08)';
                categoryLabel = 'WEATHER ALERT';
                labelBg = 'rgba(186, 26, 26, 0.08)';
                labelText = '#ba1a1a';
              } else if (notif.iconName === 'price') {
                iconElement = <TrendingUp size={18} color="#006e2f" />;
                iconBgColor = 'rgba(0, 110, 47, 0.08)';
                categoryLabel = 'MARKET UPDATE';
                labelBg = 'rgba(0, 110, 47, 0.08)';
                labelText = '#006e2f';
              } else if (notif.iconName === 'ai') {
                iconElement = <Sparkles size={18} color="#7c3aed" />;
                iconBgColor = 'rgba(124, 58, 237, 0.08)';
                categoryLabel = 'AI ADVISOR';
                labelBg = 'rgba(124, 58, 237, 0.08)';
                labelText = '#7c3aed';
              } else if (notif.iconName === 'info') {
                iconElement = <Sparkles size={18} color="#1d4ed8" />;
                iconBgColor = 'rgba(59, 130, 246, 0.08)';
                categoryLabel = 'GOVT SCHEME';
                labelBg = 'rgba(59, 130, 246, 0.08)';
                labelText = '#1d4ed8';
              } else if (notif.iconName === 'warning') {
                iconElement = <AlertTriangle size={18} color="#ea580c" />;
                iconBgColor = 'rgba(249, 115, 22, 0.08)';
                categoryLabel = 'SCHEME DEADLINE';
                labelBg = 'rgba(249, 115, 22, 0.08)';
                labelText = '#ea580c';
              }

              return (
                <TouchableOpacity
                  key={notif.id}
                  onPress={() => handlePressNotification(notif)}
                  activeOpacity={0.8}
                >
                  <Card 
                    variant="white"
                    style={{ 
                      borderRadius: 24, 
                      padding: 14,
                      borderWidth: 1.5,
                      borderColor: notif.unread ? 'rgba(0, 110, 47, 0.15)' : '#f1f8ee',
                      backgroundColor: notif.unread ? '#fbfdfa' : '#FFFFFF',
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'center',
                      shadowColor: '#166534',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: notif.unread ? 0.03 : 0.01,
                      shadowRadius: 6,
                      elevation: notif.unread ? 2 : 1
                    }}
                  >
                    {/* Left Icon circle with soft transparent background tint */}
                    <View 
                      style={{ 
                        width: 38, 
                        height: 38, 
                        borderRadius: 19, 
                        backgroundColor: iconBgColor, 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      {iconElement}
                    </View>

                    {/* Middle details */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <View 
                          style={{ 
                            backgroundColor: labelBg, 
                            paddingHorizontal: 8, 
                            paddingVertical: 3, 
                            borderRadius: 6 
                          }}
                        >
                          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: '800', color: labelText }}>
                            {categoryLabel}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '700', color: '#94a3b8' }}>
                          {notif.time}
                        </Text>
                      </View>
                      
                      <Text 
                        style={{ 
                          fontFamily: 'Inter', 
                          fontSize: 14, 
                          fontWeight: '800', 
                          color: FarmoraColors.textDark,
                          opacity: notif.unread ? 1 : 0.8
                        }}
                      >
                        {notif.title}
                      </Text>
                      
                      <Text 
                        style={{ 
                          fontFamily: 'Inter', 
                          fontSize: 11, 
                          color: FarmoraColors.textGray, 
                          marginTop: 4, 
                          lineHeight: 16,
                          opacity: notif.unread ? 1 : 0.75
                        }}
                      >
                        {notif.body}
                      </Text>
                    </View>

                    {/* Right Unread Indicator dot */}
                    {notif.unread && (
                      <View 
                        style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: FarmoraColors.primary 
                        }} 
                      />
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Actionable Empty State */
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 30 }}>
            <View 
              style={{ 
                width: 90, 
                height: 90, 
                borderRadius: 45, 
                backgroundColor: '#edf6ea', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 24,
                borderWidth: 1.5,
                borderColor: '#e8f0e4',
                shadowColor: '#166534',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
                elevation: 2
              }}
            >
              <Bell size={38} color={FarmoraColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: '900', color: FarmoraColors.textDark }}>
              You're all caught up!
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: FarmoraColors.textGray, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              No notifications to display. We will notify you when there are new weather warnings, scheme deadlines, or mandi updates.
            </Text>
            
            {/* Quick Actions in Empty State */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 32, width: '100%', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => router.replace('/(tabs)/calendar')}
                style={{
                  flex: 1,
                  maxWidth: 140,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1.5,
                  borderColor: '#e8f0e4',
                  borderRadius: 16,
                  paddingVertical: 12,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.02,
                  shadowRadius: 4,
                  elevation: 1
                }}
              >
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.primary }}>
                  Go to Calendar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/weather-report')}
                style={{
                  flex: 1,
                  maxWidth: 140,
                  backgroundColor: FarmoraColors.primary,
                  borderRadius: 16,
                  paddingVertical: 12,
                  alignItems: 'center',
                  shadowColor: FarmoraColors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 2
                }}
              >
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
                  Check Weather
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      )}
    </View>
  );
}
