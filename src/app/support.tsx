import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, LayoutAnimation, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Mail, MessageSquare, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react-native';
import { FarmoraColors } from '../constants/colors';

const FAQS = [
  {
    question: 'How do I scan a crop for disease detection?',
    answer: 'Go to the Detect tab from the lower navigation bar, tap on "Open Camera" to take a clear, well-lit photo of the affected plant leaf, or select one from your gallery. Our AI will analyze it in seconds.'
  },
  {
    question: 'How can I sell my harvest in the local market?',
    answer: 'Navigate to the Market tab, tap on "Add Listing" at the top right, fill in your crop details, quantity, price, and contact details, and publish it. Nearby buyers will see it instantly.'
  },
  {
    question: 'Can I use Farmora offline?',
    answer: 'Yes! The Crop Calendar and previously cached listings are available offline. However, live weather forecasts, crop diagnostics, and publishing new listings require internet connectivity.'
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleContact = (method: string) => {
    Alert.alert('Contacting Support', `Opening ${method} integration for agricultural assistance.`);
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
          Help Center & Support
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Support Channels */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
          <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#0F172A' }} className="mb-4">
            Contact Agri Experts
          </Text>

          {/* Phone Call */}
          <TouchableOpacity
            onPress={() => {
              Linking.openURL('tel:18001801551').catch(() => {
                Alert.alert('Error', 'Unable to initiate call to 1800-180-1551.');
              });
            }}
            className="flex-row items-center gap-4 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/50 mb-3 active:scale-95"
          >
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
              <Phone size={18} color={FarmoraColors.primary} />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                Kisan Call Centre Helpline
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 1 }}>
                1800-180-1551 or 1551 (Toll Free)
              </Text>
            </View>
          </TouchableOpacity>

          {/* WhatsApp Message */}
          <TouchableOpacity
            onPress={() => {
              Linking.openURL('https://wa.me/917337359375').catch(() => {
                Alert.alert('Error', 'Unable to open WhatsApp on this device.');
              });
            }}
            className="flex-row items-center gap-4 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/50 mb-3 active:scale-95"
          >
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
              <MessageSquare size={18} color={FarmoraColors.primary} />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                WhatsApp Center Booking
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 1 }}>
                Message 7337359375 to book purchase center, date & time
              </Text>
            </View>
          </TouchableOpacity>

          {/* Email Support */}
          <TouchableOpacity
            onPress={() => {
              Linking.openURL('mailto:support.agriinfra@gov.in').catch(() => {
                Alert.alert('Error', 'Unable to open email client on this device.');
              });
            }}
            className="flex-row items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 active:scale-95"
          >
            <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
              <Mail size={18} color="#475569" />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                Email Support Desk
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 1 }}>
                support.agriinfra@gov.in
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <HelpCircle size={18} color="#0F172A" />
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '800', color: '#0F172A' }}>
              Frequently Asked Questions
            </Text>
          </View>

          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <View 
                key={idx}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-3 overflow-hidden"
              >
                <TouchableOpacity
                  onPress={() => toggleFaq(idx)}
                  className="flex-row items-center justify-between p-4"
                  activeOpacity={0.8}
                >
                  <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#1E293B' }} className="flex-1 pr-2">
                    {faq.question}
                  </Text>
                  {isOpen ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                </TouchableOpacity>

                {isOpen && (
                  <View className="px-4 pb-4 border-t border-slate-50 pt-2">
                    <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#475569', lineHeight: 18 }}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
