import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  TextInput,
  Platform,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  MapPin, 
  Info, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Search
} from 'lucide-react-native';

import { useAppStore } from '../store/useAppStore';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { FarmoraColors } from '../constants/colors';
import locationsData from '../data/locations.json';

interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string | number;
  max_price: string | number;
  modal_price: string | number;
}

// Maps state names from locations.json to spelling conventions used by Agmarknet API
const mapStateNameToAgmarknet = (stateName: string): string => {
  const mapping: Record<string, string> = {
    'Kerala': 'Keralam',
    'Orissa': 'Odisha',
    'Uttaranchal': 'Uttarakhand',
    'Chhattisgarh': 'Chattisgarh',
  };
  return mapping[stateName] || stateName;
};

// Fuzzy normalized string helper that removes spacing, special chars, and vowels to handle spelling variations
const getFuzzyNormalized = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/[aeiou]/g, '');
};

const matchesFuzzy = (val1: string, val2: string): boolean => {
  const norm1 = getFuzzyNormalized(val1);
  const norm2 = getFuzzyNormalized(val2);
  if (!norm1 || !norm2) return false;
  return norm1.includes(norm2) || norm2.includes(norm1);
};

// Normalized, fuzzy comparison for district name variations (e.g., Banaskantha vs Banaskanth, Chittoor vs Chittor)
const matchesDistrict = (recordDistrict: string, targetDistrict: string): boolean => {
  return matchesFuzzy(recordDistrict, targetDistrict);
};

// Normalized check to see if a Mandi (market) name matches the selected Mandal name
const matchesMandal = (marketName: string, targetMandal: string): boolean => {
  return matchesFuzzy(marketName, targetMandal);
};

export default function MarketTrendingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAppStore();

  // Location filter state
  const [selectedState, setSelectedState] = useState<string | null>(profile?.state || null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(profile?.district || null);
  const [selectedMandal, setSelectedMandal] = useState<string | null>(profile?.mandal || null);

  // API State (holds all records for the selected state)
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Commodity search query
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded commodity state
  const [expandedCommodities, setExpandedCommodities] = useState<Record<string, boolean>>({});

  // Sync profile location values when profile loads
  useEffect(() => {
    if (profile) {
      if (profile.state && !selectedState) setSelectedState(profile.state);
      if (profile.district && !selectedDistrict) setSelectedDistrict(profile.district);
      if (profile.mandal && !selectedMandal) setSelectedMandal(profile.mandal);
    }
  }, [profile]);

  // Extract list of states from locations hierarchy
  const states = useMemo(() => {
    if (!locationsData || !locationsData.states) return [];
    return locationsData.states.map((s) => s.name);
  }, []);

  // Get unique list of districts that have active reports in this state
  const availableDistrictsInState = useMemo(() => {
    const dists = new Set<string>();
    records.forEach((r) => {
      if (r.district) dists.add(r.district);
    });
    return Array.from(dists).sort();
  }, [records]);

  // Compute districts dependent on state selection and API data
  const districts = useMemo(() => {
    if (availableDistrictsInState.length > 0) {
      return availableDistrictsInState;
    }
    const currentState = selectedState;
    if (!currentState || !locationsData || !locationsData.states) return [];
    const stateObj = locationsData.states.find((s) => s.name === currentState);
    return stateObj ? stateObj.districts.map((d) => d.name) : [];
  }, [selectedState, availableDistrictsInState]);

  // Compute mandals dependent on district selection
  const mandals = useMemo(() => {
    const currentState = selectedState;
    const currentDistrict = selectedDistrict;
    if (!currentState || !currentDistrict || !locationsData || !locationsData.states) return [];
    const stateObj = locationsData.states.find((s) => s.name === currentState);
    if (!stateObj) return [];
    const districtObj = stateObj.districts.find((d) => matchesDistrict(d.name, currentDistrict));
    return districtObj ? districtObj.mandals.map((m) => m.name) : [];
  }, [selectedState, selectedDistrict]);

  // Fetch prices handler - retrieves all daily price records for the entire State
  const fetchMandiPrices = async (stateName: string) => {
    setLoading(true);
    setError(null);
    try {
      const agmarknetState = mapStateNameToAgmarknet(stateName);
      // Fetch up to 2500 daily records for the state to avoid truncation and enable local fuzzy matching
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd0000014c80ce70f8a047ff460e351fbde21d61&format=json&limit=2500&filters[state.keyword]=${encodeURIComponent(agmarknetState)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const json = await response.json();
      if (json && json.records) {
        setRecords(json.records);
        
        // Auto-expand first few items based on state-level group keys
        const groupedKeys = Object.keys(groupAndProcessData(json.records));
        if (groupedKeys.length > 0) {
          const autoExpand: Record<string, boolean> = {};
          groupedKeys.slice(0, 2).forEach((k) => {
            autoExpand[k] = true;
          });
          setExpandedCommodities(autoExpand);
        }
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      console.error('Error fetching Agmarknet mandi prices:', err);
      setError('Unable to fetch live mandi prices. Please ensure you are connected to the internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when selectedState changes
  useEffect(() => {
    if (selectedState) {
      fetchMandiPrices(selectedState);
    } else {
      setRecords([]);
    }
  }, [selectedState]);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedDistrict(null);
    setSelectedMandal(null);
    setRecords([]);
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSelectedMandal(null);
    // Instant local filtering, no additional network request required!
  };

  const handleRefresh = () => {
    if (selectedState) {
      fetchMandiPrices(selectedState);
    } else {
      Alert.alert('Selection Required', 'Please select a State first.');
    }
  };

  // Local helper to group and compute mandi details
  const groupAndProcessData = (sourceRecords: MandiRecord[]) => {
    const grouped: Record<string, MandiRecord[]> = {};
    sourceRecords.forEach((record) => {
      const key = record.commodity;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record);
    });
    return grouped;
  };



  // Process and compute stats for commodities in the selected district/mandal
  const processedCommodities = useMemo(() => {
    // 1. Filter state-wide records by selected district using normalized substring matching
    const districtRecords = records.filter((r) => 
      selectedDistrict ? matchesDistrict(r.district, selectedDistrict) : true
    );

    const grouped = groupAndProcessData(districtRecords);
    const result: Array<{
      commodity: string;
      avgPrice: number;
      minMandi: string;
      minPrice: number;
      maxMandi: string;
      maxPrice: number;
      markets: Array<MandiRecord & { parsedModal: number }>;
      fallbackToDistrict: boolean;
    }> = [];

    Object.keys(grouped).forEach((commodity) => {
      // Map records with numeric prices
      const marketsList = grouped[commodity].map((m) => ({
        ...m,
        parsedModal: parseFloat(String(m.modal_price)) || 0
      }));

      // 2. Filter by Mandal if selected
      let finalMarkets = marketsList;
      let fallbackToDistrict = false;
      
      if (selectedMandal) {
        finalMarkets = marketsList.filter((m) => matchesMandal(m.market, selectedMandal));
        // Fallback: if no mandi in this commodity matches the selected Mandal, show all mandis in the district
        if (finalMarkets.length === 0) {
          finalMarkets = marketsList;
          fallbackToDistrict = true;
        }
      }

      // Sort markets by modal price descending
      finalMarkets.sort((a, b) => b.parsedModal - a.parsedModal);

      const prices = finalMarkets.map((m) => m.parsedModal).filter((p) => p > 0);
      if (prices.length === 0) return;

      const sum = prices.reduce((acc, p) => acc + p, 0);
      const avgPrice = Math.round(sum / prices.length);

      const maxPrice = finalMarkets[0].parsedModal;
      const maxMandi = finalMarkets[0].market;

      const minPrice = finalMarkets[finalMarkets.length - 1].parsedModal;
      const minMandi = finalMarkets[finalMarkets.length - 1].market;

      result.push({
        commodity,
        avgPrice,
        minMandi,
        minPrice,
        maxMandi,
        maxPrice,
        markets: finalMarkets,
        fallbackToDistrict
      });
    });

    // Apply search filter if present
    if (searchQuery.trim()) {
      return result.filter((item) => 
        item.commodity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [records, selectedDistrict, selectedMandal, searchQuery]);

  const toggleExpand = (commodity: string) => {
    setExpandedCommodities((prev) => ({
      ...prev,
      [commodity]: !prev[commodity]
    }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Navigation Header */}
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
          <Text style={styles.headerSubtitle}>Live prices from Agmarknet government database</Text>
        </View>
        <TouchableOpacity 
          onPress={handleRefresh} 
          style={styles.refreshBtn}
          disabled={loading}
          accessibilityLabel="Refresh price data"
        >
          {loading ? (
            <ActivityIndicator color={FarmoraColors.primary} size="small" />
          ) : (
            <RefreshCw size={18} color={FarmoraColors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* State/District/Mandal Filter selectors */}
        <View style={styles.filterCard}>
          <Text style={styles.filterCardTitle}>Select Region</Text>
          
          <SearchableDropdown
            label="State"
            placeholder="Select State"
            data={states}
            value={selectedState}
            onChange={handleStateChange}
          />

          <SearchableDropdown
            label="District"
            placeholder={selectedState ? "Select District" : "First select State"}
            data={districts}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedState}
          />

          <SearchableDropdown
            label="Mandal"
            placeholder={selectedDistrict ? "Select Mandal" : "First select District"}
            data={mandals}
            value={selectedMandal}
            onChange={setSelectedMandal}
            disabled={!selectedDistrict}
          />
        </View>

        {/* API Response UI Stream */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={FarmoraColors.primary} size="large" />
            <Text style={styles.loaderText}>Fetching daily mandi prices from government portal...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Info size={24} color="#EF4444" style={{ marginBottom: 10 }} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry Fetch</Text>
            </TouchableOpacity>
          </View>
        ) : !selectedState || !selectedDistrict ? (
          <View style={styles.placeholderCard}>
            <MapPin size={32} color={FarmoraColors.primary} style={{ marginBottom: 12, opacity: 0.8 }} />
            <Text style={styles.placeholderTitle}>Choose your district</Text>
            <Text style={styles.placeholderSubtitle}>
              Please select a State and District to see live price reports and compare different markets in your area.
            </Text>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.placeholderCard}>
            <TrendingUp size={32} color="#94A3B8" style={{ marginBottom: 12 }} />
            <Text style={styles.placeholderTitle}>No prices reported in this state</Text>
            <Text style={styles.placeholderSubtitle}>
              There are no daily price updates reported in {selectedState} today. Please check back later or try another state.
            </Text>
          </View>
        ) : processedCommodities.length === 0 ? (
          // UX Fallback
          <View style={styles.placeholderCard}>
            <Info size={32} color="#D97706" style={{ marginBottom: 12 }} />
            <Text style={styles.placeholderTitle}>No records in this district</Text>
            <Text style={styles.placeholderSubtitle}>
              We couldn't find daily prices matching "{selectedDistrict}" today.
              {"\n\n"}
              However, daily price reports are active for these other districts in {selectedState}:
              {"\n\n"}
              {availableDistrictsInState.length > 0 
                ? availableDistrictsInState.slice(0, 12).join(', ') + '...'
                : 'No other districts reported today.'
              }
            </Text>
          </View>
        ) : (
          <>
            {/* Commodity Search Bar */}
            <View style={styles.searchBar}>
              <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search commodities (e.g. Rice, Potato)"
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <XIcon size={16} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* List of Commodities */}
            {processedCommodities.map((item) => {
              const isExpanded = !!expandedCommodities[item.commodity];
              const showMandiComparison = item.markets.length > 1;

              return (
                <View key={item.commodity} style={styles.commodityCard}>
                  {/* Header Row */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleExpand(item.commodity)}
                    style={styles.commodityHeader}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.commodityName}>{item.commodity}</Text>
                      <Text style={styles.commodityMeta}>
                        Avg {item.fallbackToDistrict ? 'District' : (selectedMandal ? 'Mandal' : 'District')} Price:{' '}
                        <Text style={{ fontWeight: '800', color: FarmoraColors.primary }}>₹{item.avgPrice}/q</Text>
                        {showMandiComparison ? ` • ${item.markets.length} Markets` : ' • 1 Market'}
                      </Text>
                    </View>
                    
                    {isExpanded ? (
                      <ChevronUp size={20} color="#1B5E20" />
                    ) : (
                      <ChevronDown size={20} color="#1B5E20" />
                    )}
                  </TouchableOpacity>

                  {/* Mandi comparative list when expanded */}
                  {isExpanded && (
                    <View style={styles.comparisonBody}>
                      {/* Notice if we fell back to district-level reports */}
                      {item.fallbackToDistrict && (
                        <View style={styles.fallbackNotice}>
                          <Info size={12} color="#D97706" style={{ marginRight: 6 }} />
                          <Text style={styles.fallbackNoticeText}>
                            No mandis found matching mandal "{selectedMandal}". Showing all mandis in "{selectedDistrict}" district.
                          </Text>
                        </View>
                      )}

                      {/* Mandi details */}
                      {item.markets.map((marketRecord, idx) => {
                        const isBestPrice = showMandiComparison && idx === 0;
                        const isLowestPrice = showMandiComparison && idx === item.markets.length - 1;
                        
                        // Compute horizontal bar percentage width
                        const maxPriceInGroup = item.maxPrice || 1;
                        const barWidthPercentage = maxPriceInGroup > 0 
                          ? (marketRecord.parsedModal / maxPriceInGroup) * 100 
                          : 0;

                        // Compute variance from average
                        const variance = marketRecord.parsedModal - item.avgPrice;
                        const isPositiveVariance = variance >= 0;

                        return (
                          <View 
                            key={`${marketRecord.market}_${idx}`} 
                            style={[
                              styles.mandiRow,
                              idx !== item.markets.length - 1 && styles.borderBottom
                            ]}
                          >
                            {/* Mandi name, variety details */}
                            <View style={styles.mandiNameRow}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.mandiName}>{marketRecord.market} Mandi</Text>
                                <Text style={styles.mandiVariety}>{marketRecord.variety} • Variety</Text>
                              </View>
                              
                              {/* price tags */}
                              <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.mandiModalPrice}>₹{marketRecord.modal_price}/q</Text>
                                <Text style={styles.mandiMinMax}>
                                  Min: ₹{marketRecord.min_price} • Max: ₹{marketRecord.max_price}
                                </Text>
                              </View>
                            </View>

                            {/* Price variance label */}
                            {showMandiComparison && (
                              <View style={styles.varianceRow}>
                                <Text 
                                  style={[
                                    styles.varianceText, 
                                    { color: isPositiveVariance ? '#2E7D32' : '#DC2626' }
                                  ] as any}
                                >
                                  {isPositiveVariance ? '+' : ''}₹{variance} / quintal {isPositiveVariance ? 'above' : 'below'} average
                                </Text>
                                
                                {isBestPrice && (
                                  <View style={[styles.mandiBadge, styles.mandiBadgeBest] as any}>
                                    <Text style={styles.mandiBadgeTextBest as any}>Best Price</Text>
                                  </View>
                                )}
                                {isLowestPrice && (
                                  <View style={[styles.mandiBadge, styles.mandiBadgeLowest] as any}>
                                    <Text style={styles.mandiBadgeTextLowest as any}>Lowest Price</Text>
                                  </View>
                                )}
                              </View>
                            )}

                            {/* Graphical comparison bar */}
                            <View style={styles.barChartContainer as any}>
                              <View 
                                style={[
                                  styles.barChartFill, 
                                  { 
                                    width: `${barWidthPercentage}%`,
                                    backgroundColor: isBestPrice 
                                      ? '#2E7D32' 
                                      : isLowestPrice 
                                        ? '#DC2626' 
                                        : '#0284C7'
                                  }
                                ] as any} 
                              />
                            </View>
                          </View>
                        );
                      })}

                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Inline Close Cross icon
const XIcon = ({ size, color }: { size: number; color: string }) => (
  <View style={{ padding: 4 }}>
    <Text style={{ fontSize: size, color, fontWeight: '800' }}>✕</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E8F0E5',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '900',
    color: '#1B5E20',
  },
  headerSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F0E5',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterCardTitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '900',
    color: '#1B5E20',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8F0E5',
    marginTop: 10,
  },
  loaderText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 10,
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8F0E5',
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  placeholderTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 6,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F0E5',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#333333',
  },
  noSearchText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
  },
  commodityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8F0E5',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  commodityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  commodityName: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '900',
    color: '#1B5E20',
  },
  commodityMeta: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginTop: 4,
  },
  comparisonBody: {
    borderTopWidth: 1,
    borderColor: '#F1F5F0',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FAFCF9',
  },
  fallbackNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 6,
  },
  fallbackNoticeText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
    flex: 1,
    lineHeight: 15,
  },
  mandiRow: {
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: '#F1F5F0',
  },
  mandiNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mandiName: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: '#2C3E2D',
  },
  mandiVariety: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
    marginTop: 2,
  },
  mandiModalPrice: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '900',
    color: '#1B5E20',
  },
  mandiMinMax: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#999999',
    marginTop: 2,
  },
  varianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  varianceText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
  },
  mandiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mandiBadgeBest: {
    backgroundColor: '#E8F5E9',
  },
  mandiBadgeLowest: {
    backgroundColor: '#FFEBEE',
  },
  mandiBadgeTextBest: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '800',
    color: '#2E7D32',
    textTransform: 'uppercase',
  },
  mandiBadgeTextLowest: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '800',
    color: '#C62828',
    textTransform: 'uppercase',
  },
  barChartContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  barChartFill: {
    height: '100%',
    borderRadius: 3,
  },
});
