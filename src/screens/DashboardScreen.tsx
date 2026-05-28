import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Cloud, Calendar, MapPin, Sprout, AlertTriangle, TrendingUp, Landmark } from 'lucide-react-native';
import { HomeHeader } from '../components/HomeHeader';
import { Card } from '../components/ui/Card';
import { useAppStore } from '../store/useAppStore';
import { FarmoraColors } from '../constants/colors';
import { useTranslation } from '../hooks/useTranslation';
import { useClimate } from '../hooks/useClimate';
import { WeatherSummary } from '../components/WeatherSummary';
import { RainWarningCard } from '../components/RainWarningCard';
import { mockTasks } from '../data/mockTasks';
import { openGoogleMapsSearch } from '../utils/maps';
import { openWebLink } from '../utils/browser';

const todayDate = new Date();
const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
const tomorrowDate = new Date(todayDate); tomorrowDate.setDate(todayDate.getDate() + 1);
const tomorrowStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

export default function DashboardScreen() {
  const router = useRouter();
  const { locationName, profile, createNotification } = useAppStore();
  const { t } = useTranslation();
  const { currentWeather, alerts, loading, error } = useClimate();

  // Find if there is a primary critical alert (danger or warning) to highlight at the top
  const criticalAlert = alerts.length > 0 ? alerts[0] : null;

  const notifiedAlerts = React.useRef<Record<string, boolean>>({});

  // Trigger mobile local notification when a critical weather alert is loaded
  React.useEffect(() => {
    if (criticalAlert && !notifiedAlerts.current[criticalAlert.title]) {
      notifiedAlerts.current[criticalAlert.title] = true;
      createNotification(
        `Weather Alert: ${criticalAlert.title} ⚠️`,
        criticalAlert.description || 'Take immediate precaution on your farm.',
        'alerts'
      );
    }
  }, [criticalAlert, createNotification]);

  return (
    <View className="flex-1" style={{ backgroundColor: FarmoraColors.background }}>
      <HomeHeader />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Weather Summary Card */}
        <WeatherSummary 
          data={currentWeather} 
          alerts={alerts} 
          loading={loading} 
          error={error} 
        />

        {/* High Priority Weather Alert Notice */}
        {criticalAlert && (
          <RainWarningCard 
            alert={criticalAlert} 
          />
        )}

        {/* Quick Tools Grid */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: '800', color: FarmoraColors.textDark }} className="mb-3">
            Quick Tools
          </Text>
          
          <View className="flex-row gap-3 mb-3">
            {/* Crop Recommendation */}
            <TouchableOpacity 
              onPress={() => router.push('/crop-recommendation')} 
              style={{ borderRadius: 24 }}
              className="flex-1 bg-white p-4 border border-slate-100 shadow-sm active:scale-95"
            >
              <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: '#e2f5e7' }}>
                <Sprout size={20} color={FarmoraColors.primary} />
              </View>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.textDark }}>
                Crop Rec.
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-0.5">
                Optimize Yield
              </Text>
            </TouchableOpacity>

            {/* Weather Report */}
            <TouchableOpacity 
              onPress={() => router.push('/weather-report')} 
              style={{ borderRadius: 24 }}
              className="flex-1 bg-white p-4 border border-slate-100 shadow-sm active:scale-95"
            >
              <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: '#ecfeff' }}>
                <Cloud size={20} color="#0891b2" />
              </View>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.textDark }}>
                Weather
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-0.5">
                7-Day Forecast
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            {/* Market Trendings */}
            <TouchableOpacity 
              onPress={() => openWebLink('https://agmarknet.gov.in/home')} 
              style={{ borderRadius: 24 }}
              className="flex-1 bg-white p-4 border border-slate-100 shadow-sm active:scale-95"
            >
              <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: '#e0f2fe' }}>
                <TrendingUp size={20} color="#0284c7" />
              </View>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.textDark }}>
                Mandi Trends
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-0.5">
                Market Prices
              </Text>
            </TouchableOpacity>

            {/* Government Schemes */}
            <TouchableOpacity 
              onPress={() => openWebLink('https://www.myscheme.gov.in/search')} 
              style={{ borderRadius: 24 }}
              className="flex-1 bg-white p-4 border border-slate-100 shadow-sm active:scale-95"
            >
              <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: '#fef3c7' }}>
                <Landmark size={20} color="#d97706" />
              </View>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: FarmoraColors.textDark }}>
                Govt Schemes
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-0.5">
                Search Subsidies
              </Text>
            </TouchableOpacity>
          </View>
        </View>
 
        {/* Crop Calendar Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: '800', color: FarmoraColors.textDark }}>
              {t('crop_calendar')}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/calendar')}>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: FarmoraColors.primary }}>
                View all
              </Text>
            </TouchableOpacity>
          </View>
 
          <Card className="p-4 bg-white border border-slate-100" style={{ borderRadius: 24 }}>
            <View className="flex-row items-center">
              {/* Today's Date badge */}
              <View 
                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: '#edf6ea' }}
              >
                <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '800', color: FarmoraColors.textGray, textTransform: 'uppercase' }}>
                  {todayDate.toLocaleString('en-US', { month: 'short' })}
                </Text>
                <Text style={{ fontFamily: 'Inter', fontSize: 24, fontWeight: '900', color: FarmoraColors.primary }}>
                  {todayDate.getDate()}
                </Text>
              </View>

              {/* First task of today or tomorrow */}
              {(() => {
                const todayTask = (mockTasks[todayStr] || [])[0];
                const tomorrowTask = (mockTasks[tomorrowStr] || [])[0];
                const task = todayTask || tomorrowTask;
                const isToday = !!todayTask;
                if (!task) return (
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: FarmoraColors.textGray }}>
                      No tasks scheduled today
                    </Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-1">
                      Tap the Calendar tab to add tasks
                    </Text>
                  </View>
                );
                return (
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <View className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5" />
                      <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: FarmoraColors.textGray }}>
                        {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '800', color: FarmoraColors.textDark }}>
                      {task.title}
                    </Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '600', color: FarmoraColors.textGray }} className="mt-1">
                      {isToday ? 'Today' : 'Tomorrow'} • {task.time}
                    </Text>
                  </View>
                );
              })()}
            </View>
          </Card>
        </View>

        {/* Local Wholesale Markets (Horizontal Scroll) */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: '800', color: FarmoraColors.textDark }}>
              {'Local Markets'}
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingRight: 20 }}
            className="flex-row"
          >
            {[
              {
                id: 'm1',
                crop: 'Paddy / Rice',
                label: 'Rice Market',
                image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=250',
              },
              {
                id: 'm2',
                crop: 'Wheat',
                label: 'Wheat Market',
                image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=250',
              },
              {
                id: 'm3',
                crop: 'Tomato',
                label: 'Tomato Market',
                image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=250',
              },
              {
                id: 'm4',
                crop: 'Cotton',
                label: 'Cotton Market',
                image: 'https://images.unsplash.com/photo-1594900222462-818cf2a37787?q=80&w=250',
              },
              {
                id: 'm5',
                crop: 'Maize / Corn',
                label: 'Maize Market',
                image: 'https://images.unsplash.com/photo-1551754625-702377370d6b?q=80&w=250',
              },
            ].map((marketObj) => {
              const hasLocation = !!(profile?.state && profile?.district && profile?.mandal);
              const marketSub = hasLocation ? `Near ${profile?.mandal}` : 'Configure location';

              const handleMarketPress = () => {
                if (hasLocation) {
                  openGoogleMapsSearch(marketObj.crop, profile?.mandal || null, profile?.district || null, profile?.state || null);
                } else {
                  Alert.alert(
                    t('location_required') || 'Location Required',
                    t('location_required_desc') || 'Please set your State, District, and Mandal in profile settings to locate wholesale markets near you.',
                    [
                      { text: t('cancel') || 'Cancel', style: 'cancel' },
                      { text: t('set_location') || 'Set Location', onPress: () => router.push('/(auth)/user-details') }
                    ]
                  );
                }
              };

              return (
                <TouchableOpacity
                  key={marketObj.id}
                  onPress={handleMarketPress}
                  className="bg-white mr-4 p-3 border border-slate-100 active:scale-95"
                  style={{
                    width: 160,
                    borderRadius: 24,
                    shadowColor: '#166534',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                >
                  <Image
                    source={{ uri: marketObj.image }}
                    className="w-full h-24 rounded-2xl mb-2 bg-slate-50"
                    resizeMode="cover"
                  />
                  <Text numberOfLines={1} style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: FarmoraColors.textDark }}>
                    {marketObj.label}
                  </Text>
                  
                  <View className="flex-row justify-between items-center mt-2">
                    <Text numberOfLines={1} style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '700', color: FarmoraColors.primary, flex: 1, marginRight: 4 }}>
                      {marketObj.crop}
                    </Text>
                    <View className="flex-row items-center">
                      <MapPin size={10} color={FarmoraColors.textGray} style={{ marginRight: 2 }} />
                      <Text numberOfLines={1} style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: FarmoraColors.textGray, maxWidth: 64 }}>
                        {marketSub}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Disease Alert Card (Red Alert) */}
        <Card 
          className="p-5 mb-8 flex-col border bg-[#ffdad6]"
          style={{
            borderRadius: 24,
            borderColor: 'rgba(186, 26, 26, 0.1)',
          }}
        >
          <View className="flex-row items-start gap-4 mb-3">
            <View 
              className="w-10 h-10 rounded-2xl items-center justify-center"
              style={{ backgroundColor: 'rgba(186, 26, 26, 0.1)' }}
            >
              <AlertTriangle size={22} color="#ba1a1a" />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: '#ba1a1a' }}>
                {t('disease_alert')}
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#3d4a3d', fontWeight: '500' }} className="mt-1 leading-4">
                {t('disease_alert_desc')}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)/detect')}
            className="bg-[#fceae8] py-2 px-4 rounded-xl border border-red-100 mt-2 align-self-start self-start"
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#ba1a1a' }}>
              {t('how_to_check')}
            </Text>
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </View>
  );
}
