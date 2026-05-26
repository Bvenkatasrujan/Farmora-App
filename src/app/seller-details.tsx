import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Phone, MessageSquare, MapPin, ArrowLeft, Star, Heart, Calendar } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FarmoraColors } from '../constants/colors';

export default function SellerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { sellersBuyers } = useAppStore();

  const details = sellersBuyers.find((sb) => sb.id === id);

  if (!details) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-slate-800 text-lg font-bold">Listing Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 py-2 px-4 bg-emerald-500 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${details.phone}`).catch(() => alert('Unable to place call'));
  };

  const handleWhatsApp = () => {
    const formattedPhone = details.phone.replace('+', '').replace(' ', '');
    const message = `Hello ${details.name}, I am interested in your listing of ${details.crop} for ${details.price} on Farmora.`;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => alert('WhatsApp not installed'));
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Header bar */}
      <View className="pt-6 pb-4 px-5 flex-row justify-between items-center border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-50 border border-slate-100 justify-center items-center rounded-xl active:scale-95">
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-lg font-black capitalize">{details.role} Details</Text>
        <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-slate-100 justify-center items-center rounded-xl active:scale-95">
          <Heart size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-5">
        {/* Profile Card */}
        <View className="items-center pb-6 border-b border-slate-100">
          <Image source={{ uri: details.avatar }} className="w-24 h-24 rounded-3xl border-2 border-emerald-500" />
          <Text className="text-slate-900 text-xl font-black mt-3">{details.name}</Text>
          
          <View className="flex-row items-center mt-1.5 gap-1.5">
            <View className="flex-row items-center">
              <Star size={12} color="#EAB308" fill="#EAB308" />
              <Text className="text-slate-700 text-xs font-bold ml-1">{details.rating}</Text>
            </View>
            <Text className="text-slate-300 text-xs">|</Text>
            <View className="flex-row items-center">
              <MapPin size={12} color={FarmoraColors.primary} />
              <Text className="text-slate-500 text-xs ml-1 font-semibold">{details.distance}</Text>
            </View>
          </View>
        </View>

        {/* Listing Details */}
        <View className="py-6">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Deal Information</Text>
          <Card variant="gradient" className="p-5 border-emerald-100/50 bg-emerald-50/20 mb-6 rounded-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-900 text-base font-extrabold">{details.crop}</Text>
              <View className="bg-emerald-500 px-3 py-1 rounded-md">
                <Text className="text-white text-[10px] font-black uppercase">{details.role}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between border-t border-slate-100 pt-4">
              <View>
                <Text className="text-slate-400 text-[10px] font-semibold uppercase">Pricing Bid</Text>
                <Text className="text-emerald-800 font-black text-lg mt-0.5">{details.price}</Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-400 text-[10px] font-semibold uppercase">Quantity Available</Text>
                <Text className="text-slate-900 font-bold text-base mt-0.5">{details.quantity}</Text>
              </View>
            </View>
          </Card>

          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2.5">Location & Farm details</Text>
          <Card variant="white" className="p-4 border border-slate-100 rounded-2xl mb-6">
            <View className="flex-row items-start mb-3 gap-2">
              <MapPin size={16} color={FarmoraColors.primaryDark} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-sm">Farming Hub Address</Text>
                <Text className="text-slate-500 text-xs font-medium mt-0.5">{details.location}, India</Text>
              </View>
            </View>
            <View className="w-full h-32 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden mt-2">
              {/* Mock Map view using high quality satellite crop grid */}
              <Image source={{ uri: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=400' }} className="w-full h-full" />
            </View>
          </Card>

          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Other active listings</Text>
          <Card variant="white" className="p-4 border border-slate-100 flex-row items-center justify-between rounded-xl mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center">
                <Text className="text-base">🌾</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-sm">Organic Mustard Seed</Text>
                <Text className="text-slate-500 text-xs font-medium">₹1,800 / quintal • 1.5 Tons</Text>
              </View>
            </View>
            <ChevronRight size={14} color="#64748B" />
          </Card>
        </View>
      </ScrollView>

      {/* Action footer */}
      <View className="flex-row gap-3 p-5 border-t border-slate-100 bg-white">
        <TouchableOpacity
          onPress={handleCall}
          className="flex-1 flex-row justify-center items-center border border-slate-200 py-4 rounded-2xl bg-white active:bg-slate-50"
        >
          <Phone size={18} color="#0F172A" />
          <Text className="text-slate-900 text-sm font-extrabold ml-2">Voice Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWhatsApp}
          className="flex-[1.5] flex-row justify-center items-center bg-emerald-500 py-4 rounded-2xl active:opacity-90 shadow-sm shadow-emerald-500/20"
        >
          <MessageSquare size={18} color="white" />
          <Text className="text-white text-sm font-extrabold ml-2 font-medium">Contact WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Inline symbol wrapper
const ChevronRight = ({ size, color }: { size: number; color: string }) => (
  <View style={{ transform: [{ rotate: '-90deg' }] }}>
    <Text style={{ fontSize: size, color }}>▼</Text>
  </View>
);
