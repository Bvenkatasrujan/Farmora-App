import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  MapPin,
  Wheat,
} from 'lucide-react-native';
import { FarmoraColors } from '../constants/colors';

interface CropPrice {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  price: number; // ₹ per quintal
  change: number; // +/- from yesterday
  unit: string;
  market: string;
  state: string;
}

const CROP_PRICES: CropPrice[] = [
  { id: '1', name: 'Paddy (Common)', nameHi: 'धान', category: 'Cereals', price: 2183, change: +12, unit: '/Qtl', market: 'Karnal', state: 'Haryana' },
  { id: '2', name: 'Wheat', nameHi: 'गेहूं', category: 'Cereals', price: 2275, change: +8, unit: '/Qtl', market: 'Ludhiana', state: 'Punjab' },
  { id: '3', name: 'Maize', nameHi: 'मक्का', category: 'Cereals', price: 1990, change: -15, unit: '/Qtl', market: 'Davangere', state: 'Karnataka' },
  { id: '4', name: 'Soybean', nameHi: 'सोयाबीन', category: 'Oilseeds', price: 4480, change: +35, unit: '/Qtl', market: 'Indore', state: 'MP' },
  { id: '5', name: 'Groundnut', nameHi: 'मूंगफली', category: 'Oilseeds', price: 5920, change: -60, unit: '/Qtl', market: 'Rajkot', state: 'Gujarat' },
  { id: '6', name: 'Cotton (Long)', nameHi: 'कपास', category: 'Fibre', price: 6700, change: +80, unit: '/Qtl', market: 'Akola', state: 'Maharashtra' },
  { id: '7', name: 'Onion', nameHi: 'प्याज', category: 'Vegetables', price: 1450, change: +120, unit: '/Qtl', market: 'Nashik', state: 'Maharashtra' },
  { id: '8', name: 'Tomato', nameHi: 'टमाटर', category: 'Vegetables', price: 2800, change: -200, unit: '/Qtl', market: 'Kolar', state: 'Karnataka' },
  { id: '9', name: 'Potato', nameHi: 'आलू', category: 'Vegetables', price: 1100, change: +50, unit: '/Qtl', market: 'Agra', state: 'UP' },
  { id: '10', name: 'Sugarcane', nameHi: 'गन्ना', category: 'Cash Crops', price: 315, change: 0, unit: '/Qtl', market: 'Muzaffarnagar', state: 'UP' },
  { id: '11', name: 'Turmeric', nameHi: 'हल्दी', category: 'Spices', price: 14200, change: +350, unit: '/Qtl', market: 'Nizamabad', state: 'Telangana' },
  { id: '12', name: 'Red Chilli', nameHi: 'लाल मिर्च', category: 'Spices', price: 11500, change: -200, unit: '/Qtl', market: 'Guntur', state: 'AP' },
  { id: '13', name: 'Chickpea', nameHi: 'चना', category: 'Pulses', price: 5500, change: +40, unit: '/Qtl', market: 'Latur', state: 'Maharashtra' },
  { id: '14', name: 'Moong Dal', nameHi: 'मूंग', category: 'Pulses', price: 7800, change: +75, unit: '/Qtl', market: 'Jaipur', state: 'Rajasthan' },
  { id: '15', name: 'Mustard', nameHi: 'सरसों', category: 'Oilseeds', price: 5100, change: -30, unit: '/Qtl', market: 'Alwar', state: 'Rajasthan' },
  { id: '16', name: 'Banana', nameHi: 'केला', category: 'Fruits', price: 1800, change: +100, unit: '/Qtl', market: 'Anand', state: 'Gujarat' },
  { id: '17', name: 'Apple', nameHi: 'सेब', category: 'Fruits', price: 9500, change: -250, unit: '/Qtl', market: 'Shimla', state: 'Himachal' },
  { id: '18', name: 'Mango', nameHi: 'आम', category: 'Fruits', price: 5200, change: +300, unit: '/Qtl', market: 'Lucknow', state: 'UP' },
];

const CATEGORIES = ['All', 'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Fibre', 'Cash Crops'];

export default function MarketStocksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [prices, setPrices] = useState(CROP_PRICES);

  const filtered = useMemo(() => {
    return prices.filter(c => {
      const matchCat = activeCategory === 'All' || c.category === activeCategory;
      const matchQ = !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.nameHi.includes(query);
      return matchCat && matchQ;
    });
  }, [prices, activeCategory, query]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate live refresh by slightly randomizing prices
    setTimeout(() => {
      setPrices(prev => prev.map(c => ({
        ...c,
        price: c.price + Math.floor(Math.random() * 21 - 10),
        change: Math.floor(Math.random() * 201 - 100),
      })));
      setRefreshing(false);
    }, 1200);
  };

  const gainers = [...prices].sort((a, b) => b.change - a.change).slice(0, 3);
  const losers = [...prices].sort((a, b) => a.change - b.change).slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={FarmoraColors.textDark} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Market Stocks</Text>
          <Text style={styles.headerSub}>Live Mandi Prices • India</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
          <RefreshCw size={18} color={FarmoraColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={FarmoraColors.primary} />}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Top Gainers & Losers Summary */}
        <View style={styles.summarySection}>
          {/* Gainers */}
          <View style={[styles.summaryCard, { borderColor: '#bbf7d0' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 }}>
              <TrendingUp size={14} color="#15803d" />
              <Text style={[styles.summaryLabel, { color: '#15803d' }]}>Top Gainers</Text>
            </View>
            {gainers.map(c => (
              <View key={c.id} style={styles.summaryRow}>
                <Text style={styles.summaryCropName} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.summaryGain}>+₹{Math.abs(c.change)}</Text>
              </View>
            ))}
          </View>

          {/* Losers */}
          <View style={[styles.summaryCard, { borderColor: '#fecaca' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 }}>
              <TrendingDown size={14} color="#dc2626" />
              <Text style={[styles.summaryLabel, { color: '#dc2626' }]}>Top Losers</Text>
            </View>
            {losers.map(c => (
              <View key={c.id} style={styles.summaryRow}>
                <Text style={styles.summaryCropName} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.summaryLoss}>-₹{Math.abs(c.change)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop prices..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}
          style={{ marginBottom: 16 }}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            >
              <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price List */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <View style={styles.listHeader}>
            <Text style={[styles.listHeaderText, { flex: 1 }]}>Crop</Text>
            <Text style={[styles.listHeaderText, { width: 90, textAlign: 'right' }]}>Price (₹)</Text>
            <Text style={[styles.listHeaderText, { width: 64, textAlign: 'right' }]}>Change</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Wheat size={32} color="#cbd5e1" />
              <Text style={styles.emptyText}>No crops found</Text>
            </View>
          ) : (
            filtered.map(crop => {
              const isUp = crop.change > 0;
              const isFlat = crop.change === 0;
              const changeColor = isFlat ? '#94a3b8' : isUp ? '#15803d' : '#dc2626';
              const changeBg = isFlat ? '#f1f5f9' : isUp ? '#dcfce7' : '#fee2e2';

              return (
                <View key={crop.id} style={styles.priceRow}>
                  {/* Crop Icon */}
                  <View style={styles.cropIcon}>
                    <Wheat size={16} color={FarmoraColors.primary} />
                  </View>

                  {/* Name */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cropName}>{crop.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={9} color="#94a3b8" />
                      <Text style={styles.cropMarket}>{crop.market}, {crop.state}</Text>
                    </View>
                  </View>

                  {/* Price */}
                  <View style={{ width: 90, alignItems: 'flex-end' }}>
                    <Text style={styles.cropPrice}>₹{crop.price.toLocaleString('en-IN')}</Text>
                    <Text style={styles.cropUnit}>{crop.unit}</Text>
                  </View>

                  {/* Change */}
                  <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
                    {isUp ? <TrendingUp size={10} color={changeColor} /> :
                      isFlat ? <Minus size={10} color={changeColor} /> :
                        <TrendingDown size={10} color={changeColor} />}
                    <Text style={[styles.changeText, { color: changeColor }]}>
                      {isFlat ? '0' : isUp ? `+${crop.change}` : crop.change}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          * Prices are indicative based on AGMARKNET data. Pull down to refresh.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '800',
    color: FarmoraColors.textDark,
  },
  headerSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 1,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarySection: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
  },
  summaryLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryCropName: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: FarmoraColors.textDark,
    flex: 1,
    marginRight: 6,
  },
  summaryGain: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  summaryLoss: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    color: '#dc2626',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: FarmoraColors.textDark,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  catChipActive: {
    backgroundColor: FarmoraColors.primary,
    borderColor: FarmoraColors.primary,
  },
  catChipText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  listHeader: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  listHeaderText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
  },
  cropIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropName: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '800',
    color: FarmoraColors.textDark,
  },
  cropMarket: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  cropPrice: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: FarmoraColors.textDark,
  },
  cropUnit: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 1,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    width: 58,
    justifyContent: 'center',
  },
  changeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  disclaimer: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
});
