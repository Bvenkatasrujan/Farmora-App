import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Settings, 
  Search, 
  Bookmark, 
  Calendar as CalendarIcon, 
  CloudRain, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { FarmoraColors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

interface Scheme {
  id: string;
  title: string;
  description: string;
  benefit: string;
  tag: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  image: string;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'warning' | 'info';
}

interface Insight {
  id: string;
  title: string;
  source: string;
  readTime: string;
  image: string;
}

export default function UpdatesSchemesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setChatVisible = useAppStore((s) => s.setChatVisible);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Schemes' | 'Events' | 'Alerts'>('All');
  const [bookmarkedItems, setBookmarkedItems] = useState<Record<string, boolean>>({});

  // Static Data
  const schemes: Scheme[] = [
    {
      id: 'scheme_pm_kisan',
      title: 'PM-KISAN Scheme',
      description: 'Direct income support for landholding farmer families across the country.',
      benefit: '₹6,000 /yr',
      tag: 'Eligible'
    },
    {
      id: 'scheme_solar_pump',
      title: 'Solar Pump Scheme',
      description: 'Get up to 60% subsidy on installing high-efficiency solar water pumps.',
      benefit: '60% Subsidy',
      tag: 'Eligible'
    }
  ];

  const events: Event[] = [
    {
      id: 'event_organic',
      title: 'Organic Farming Workshop',
      date: 'OCT 12, 2025',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400'
    },
    {
      id: 'event_agritech',
      title: 'Modern Agri-Tech Expo',
      date: 'NOV 05, 2025',
      image: 'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?q=80&w=400'
    }
  ];

  const alerts: AlertItem[] = [
    {
      id: 'alert_rain',
      title: 'Heavy Rain Warning',
      description: 'Expect 40mm rain in next 24 hours. Secure your harvests.',
      time: 'now',
      type: 'warning'
    },
    {
      id: 'alert_price',
      title: 'Market Price Update',
      description: 'Wheat prices rose by 4% in the local mandi this morning.',
      time: '2h ago',
      type: 'info'
    }
  ];

  const insights: Insight[] = [
    {
      id: 'insight_fert',
      title: 'New Subsidy Announcement: Fertilisers for Kharif Season 2025',
      source: 'AgriGov News',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=400'
    },
    {
      id: 'insight_tomato',
      title: 'Local Mandi Price Insights: Why Tomato Prices are Stabilizing',
      source: 'Market Watch',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400'
    }
  ];

  const toggleBookmark = (id: string) => {
    setBookmarkedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    Alert.alert(
      bookmarkedItems[id] ? 'Removed Bookmark' : 'Bookmarked Successfully',
      bookmarkedItems[id] ? 'Item has been removed from saved items.' : 'Item saved for quick access later.'
    );
  };

  const handleApplyScheme = (title: string) => {
    Alert.alert(
      'Application Initiated',
      `You are applying for the ${title}. Would you like to proceed with your pre-filled land details?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply Now', 
          onPress: () => {
            Alert.alert('Success', `Application submitted successfully for ${title}! We will contact you soon.`);
          } 
        }
      ]
    );
  };

  const handleRegisterEvent = (title: string) => {
    Alert.alert(
      'Registration Success',
      `You have successfully registered for the "${title}". We have sent the confirmation & joining details to your phone.`,
      [{ text: 'OK' }]
    );
  };

  const handleCheckEligibility = () => {
    Alert.alert(
      'AI Powered Matcher',
      'Checking your profile details... Based on your location & crop type (Rice), you are pre-approved for: \n\n1. PM-KISAN Scheme\n2. Solar Pump Scheme\n3. Crop Insurance Subsidy',
      [{ text: 'Great!' }]
    );
  };

  // Filter content based on active tab and query
  const filteredSchemes = schemes.filter(s => 
    (activeTab === 'All' || activeTab === 'Schemes') && 
    (s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredEvents = events.filter(e => 
    (activeTab === 'All' || activeTab === 'Events') && 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAlerts = alerts.filter(a => 
    (activeTab === 'All' || activeTab === 'Alerts') && 
    (a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              Updates & Schemes
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: FarmoraColors.textGray, marginTop: 1 }}>
              Personalized benefits for your farm
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => Alert.alert('Settings', 'Configure notification preferences & filters.')}
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
          <Settings size={18} color={FarmoraColors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 40) }}
        style={{ flex: 1 }}
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: '#FFFFFF', 
              borderRadius: 24, 
              paddingHorizontal: 16,
              height: 48,
              borderWidth: 1.5,
              borderColor: '#e8f0e4',
              shadowColor: '#166534',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2
            }}
          >
            <Search size={18} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Search schemes, subsidies, events..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ 
                flex: 1, 
                color: '#1e293b', 
                fontSize: 13, 
                fontFamily: 'Inter', 
                height: '100%',
                paddingVertical: 0
              }}
            />
          </View>
        </View>

        {/* Tab Filters */}
        <View style={{ marginTop: 14 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {(['All', 'Schemes', 'Events', 'Alerts'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    backgroundColor: isActive ? FarmoraColors.primary : '#FFFFFF',
                    borderColor: isActive ? FarmoraColors.primary : '#e8f0e4',
                    borderWidth: 1,
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    shadowColor: '#166534',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isActive ? 0.1 : 0,
                    shadowRadius: 4,
                    elevation: isActive ? 2 : 0
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
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* AI Eligibility Banner */}
        {activeTab === 'All' && !searchQuery && (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <Card 
              variant="white"
              style={{ 
                backgroundColor: FarmoraColors.primary, 
                borderRadius: 28, 
                padding: 20,
                borderWidth: 0,
                shadowColor: '#166534',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 6
              }}
            >
              <View 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.18)', 
                  paddingHorizontal: 12, 
                  paddingVertical: 4, 
                  borderRadius: 12, 
                  alignSelf: 'flex-start',
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Sparkles size={10} color="#86efac" />
                <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '800', color: '#86efac', letterSpacing: 1 }}>
                  AI-POWERED MATCH
                </Text>
              </View>
              
              <Text 
                style={{ 
                  fontFamily: 'Inter', 
                  fontSize: 16, 
                  fontWeight: '800', 
                  color: '#FFFFFF', 
                  lineHeight: 22,
                  marginBottom: 16
                }}
              >
                Based on your crops and land details, you are eligible for 3 new government schemes
              </Text>
              
              <TouchableOpacity 
                onPress={handleCheckEligibility}
                style={{ 
                  backgroundColor: '#86efac', 
                  paddingVertical: 10, 
                  paddingHorizontal: 20, 
                  borderRadius: 16, 
                  alignSelf: 'flex-start'
                }}
                activeOpacity={0.9}
              >
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: '#064e3b' }}>
                  Check Eligibility
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Recommended Schemes Section */}
        {filteredSchemes.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: FarmoraColors.textDark }}>
                Recommended Schemes
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Schemes', 'Displaying all matching schemes.')}>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: FarmoraColors.primary }}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20, gap: 14 }}>
              {filteredSchemes.map((scheme) => (
                <Card 
                  key={scheme.id}
                  variant="white"
                  style={{ 
                    borderRadius: 24, 
                    padding: 16, 
                    borderWidth: 1.5,
                    borderColor: '#f1f8ee',
                    shadowColor: '#166534',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 3
                  }}
                >
                  {/* Top Badge & Bookmark row */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ backgroundColor: '#e6f4ea', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: FarmoraColors.primary }}>
                        {scheme.tag}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleBookmark(scheme.id)} style={{ padding: 4 }}>
                      <Bookmark 
                        size={16} 
                        color={bookmarkedItems[scheme.id] ? FarmoraColors.primary : '#94a3b8'} 
                        fill={bookmarkedItems[scheme.id] ? FarmoraColors.primary : 'none'} 
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '800', color: FarmoraColors.textDark, marginBottom: 6 }}>
                    {scheme.title}
                  </Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 12, color: FarmoraColors.textGray, lineHeight: 18, marginBottom: 14 }}>
                    {scheme.description}
                  </Text>

                  {/* Benefit and CTA Footer */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#f8faf7', paddingTop: 12 }}>
                    <View>
                      <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>
                        Benefit Amount
                      </Text>
                      <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: FarmoraColors.primary, marginTop: 2 }}>
                        {scheme.benefit}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleApplyScheme(scheme.title)}
                      style={{ 
                        backgroundColor: '#044e27', 
                        paddingVertical: 8, 
                        paddingHorizontal: 18, 
                        borderRadius: 14 
                      }}
                    >
                      <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
                        Apply Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Events Section */}
        {filteredEvents.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: FarmoraColors.textDark }}>
                Upcoming Events
              </Text>
              <TouchableOpacity onPress={() => router.replace('/(tabs)/calendar')}>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: FarmoraColors.primary }}>
                  Calendar
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            >
              {filteredEvents.map((event) => (
                <View 
                  key={event.id}
                  style={{ 
                    width: 220, 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: 24, 
                    borderWidth: 1.5,
                    borderColor: '#f1f8ee',
                    overflow: 'hidden',
                    shadowColor: '#166534',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 3
                  }}
                >
                  <Image source={{ uri: event.image }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                  <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <CalendarIcon size={12} color={FarmoraColors.primary} />
                      <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '800', color: FarmoraColors.primary }}>
                        {event.date}
                      </Text>
                    </View>
                    
                    <Text 
                      numberOfLines={1} 
                      style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: FarmoraColors.textDark, marginBottom: 12 }}
                    >
                      {event.title}
                    </Text>

                    <TouchableOpacity 
                      onPress={() => handleRegisterEvent(event.title)}
                      style={{ 
                        backgroundColor: '#86efac', 
                        paddingVertical: 8, 
                        borderRadius: 12,
                        alignItems: 'center' 
                      }}
                    >
                      <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '800', color: '#064e3b' }}>
                        Register
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Critical Alerts Section */}
        {filteredAlerts.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: FarmoraColors.textDark, paddingHorizontal: 20, marginBottom: 12 }}>
              Critical Alerts
            </Text>

            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              {filteredAlerts.map((alert) => {
                const isWarning = alert.type === 'warning';
                return (
                  <View 
                    key={alert.id}
                    style={{ 
                      flexDirection: 'row', 
                      backgroundColor: isWarning ? '#fff5f5' : '#f0fdf4',
                      borderWidth: 1,
                      borderColor: isWarning ? '#fee2e2' : '#dcfce7',
                      borderRadius: 20,
                      padding: 12,
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <View 
                      style={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: 18, 
                        backgroundColor: isWarning ? '#ef4444' : '#22c55e', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      {isWarning ? (
                        <CloudRain size={18} color="white" />
                      ) : (
                        <TrendingUp size={18} color="white" />
                      )}
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: FarmoraColors.textDark }}>
                          {alert.title}
                        </Text>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '700', color: isWarning ? '#dc2626' : '#15803d' }}>
                          {alert.time}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: 'Inter', fontSize: 11, color: FarmoraColors.textGray, marginTop: 2, lineHeight: 15 }}>
                        {alert.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Latest Insights Section */}
        {activeTab === 'All' && !searchQuery && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: FarmoraColors.textDark, paddingHorizontal: 20, marginBottom: 12 }}>
              Latest Insights
            </Text>

            <View style={{ paddingHorizontal: 20, gap: 14 }}>
              {insights.map((insight) => (
                <Card 
                  key={insight.id}
                  variant="white"
                  style={{ 
                    borderRadius: 24, 
                    padding: 12,
                    borderWidth: 1.5,
                    borderColor: '#f1f8ee',
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center'
                  }}
                >
                  <Image source={{ uri: insight.image }} style={{ width: 80, height: 80, borderRadius: 16 }} resizeMode="cover" />
                  
                  <View style={{ flex: 1 }}>
                    <Text 
                      numberOfLines={2} 
                      style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.textDark, lineHeight: 16, marginBottom: 8 }}
                    >
                      {insight.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <BookOpen size={10} color="#94a3b8" />
                      <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: '700', color: '#94a3b8' }}>
                        {insight.source} • {insight.readTime}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => toggleBookmark(insight.id)} style={{ padding: 4 }}>
                    <Bookmark 
                      size={14} 
                      color={bookmarkedItems[insight.id] ? FarmoraColors.primary : '#94a3b8'} 
                      fill={bookmarkedItems[insight.id] ? FarmoraColors.primary : 'none'} 
                    />
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Ask Farmora AI Button */}
        {activeTab === 'All' && !searchQuery && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <TouchableOpacity 
              onPress={() => setChatVisible(true)}
              style={{
                backgroundColor: '#044e27',
                borderRadius: 24,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#166534',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3
              }}
            >
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                Ask Farmora AI
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
