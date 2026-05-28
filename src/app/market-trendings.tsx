import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  StyleSheet, 
  Dimensions,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  Globe, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { openWebLink } from '../utils/browser';

const { width } = Dimensions.get('window');

export default function MarketTrendingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleOpenAgmarknet = () => {
    openWebLink('https://agmarknet.gov.in/home');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3fcef" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mandi Price Trends</Text>
          <Text style={styles.headerSubtitle}>Live crop prices and market trends</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Banner Card */}
        <LinearGradient
          colors={['#e8f5e9', '#c8e6c9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerCard}
        >
          <View style={styles.iconCircle}>
            <TrendingUp size={36} color="#2E7D32" />
          </View>
          <Text style={styles.bannerTitle}>Agmarknet Daily Prices</Text>
          <Text style={styles.bannerDesc}>
            Access real-time commodity pricing reports directly from the Government of India's official Agmarknet database.
          </Text>
        </LinearGradient>

        {/* Info list */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>What You Can Find There:</Text>
          
          <View style={styles.infoRow}>
            <CheckCircle2 size={18} color="#2E7D32" style={styles.infoIcon} />
            <Text style={styles.infoText}>Variety-wise daily crop rates for all major states and districts.</Text>
          </View>

          <View style={styles.infoRow}>
            <CheckCircle2 size={18} color="#2E7D32" style={styles.infoIcon} />
            <Text style={styles.infoText}>Detailed arrival summaries and price trends over time.</Text>
          </View>

          <View style={styles.infoRow}>
            <CheckCircle2 size={18} color="#2E7D32" style={styles.infoIcon} />
            <Text style={styles.infoText}>Official market transaction details updated directly by the agricultural ministry centers.</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          onPress={handleOpenAgmarknet} 
          style={styles.actionBtn}
          activeOpacity={0.85}
        >
          <Globe size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>Open Agmarknet Website</Text>
          <ExternalLink size={14} color="#FFFFFF" style={{ marginLeft: 6, opacity: 0.8 }} />
        </TouchableOpacity>

        {/* Sub text */}
        <Text style={styles.footnote}>
          Redirects to the official government portal at https://agmarknet.gov.in
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerCard: {
    width: '100%',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bannerTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '900',
    color: '#1B5E20',
    marginBottom: 8,
  },
  bannerDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 32,
  },
  infoCardTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
  actionBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#2E7D32',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footnote: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 16,
    textAlign: 'center',
  },
});
