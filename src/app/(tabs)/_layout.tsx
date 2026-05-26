import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ShoppingBasket, Calendar, Scan, User, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FarmoraColors } from '../../constants/colors';
import { Platform, View, Text } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';


const TabIcon = ({ 
  IconComponent, 
  color, 
  focused, 
  label, 
  fillEnabled = false 
}: { 
  IconComponent: any; 
  color: string; 
  focused: boolean; 
  label: string; 
  fillEnabled?: boolean; 
}) => {
  if (focused) {
    return (
      <View 
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#edf6ea', // soft green capsule background
          borderRadius: 20, 
          paddingHorizontal: 12, 
          paddingVertical: 6,
          gap: 6,
        }}
      >
        <IconComponent 
          size={16} 
          color="#006e2f" 
          strokeWidth={2.4} 
          fill={fillEnabled ? '#006e2f' : 'none'} 
        />
        <Text 
          numberOfLines={1}
          style={{ 
            fontSize: 10, 
            fontWeight: '800', 
            color: '#006e2f', 
            fontFamily: 'Inter',
          }}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent 
        size={18} 
        color="#64748B" 
        strokeWidth={2} 
        fill="none" 
      />
      <Text 
        numberOfLines={1}
        style={{ 
          fontSize: 9, 
          fontWeight: '600', 
          color: '#64748B', 
          marginTop: 4, 
          fontFamily: 'Inter',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: FarmoraColors.primary,
        tabBarInactiveTintColor: '#64748B', // slate-500 (premium dark grey/sage tint)
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderTopWidth: 1.5,
          borderTopColor: '#e8f0e4', // soft mint cream boundary
          height: 64 + Math.max(insets.bottom, 12),
          paddingBottom: Math.max(insets.bottom, 12),
          shadowColor: '#166534',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 16,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Homes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Home} color={color} focused={focused} label="Homes" fillEnabled={true} />
          ),
        }}
      />
      <Tabs.Screen
        name="find-buyers"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={ShoppingBasket} color={color} focused={focused} label="Market" fillEnabled={true} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Calendar} color={color} focused={focused} label="Calendar" fillEnabled={false} />
          ),
        }}
      />
      <Tabs.Screen
        name="detect"
        options={{
          title: 'Detect',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Scan} color={color} focused={focused} label="Detect" fillEnabled={false} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
