import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, Flame, Wind, CloudRain, ShieldAlert } from 'lucide-react-native';
import { WeatherAlert } from '../types/climate';
import { CLIMATE_COLORS } from '../constants/climateConfig';

interface AlertCardProps {
  alerts: WeatherAlert[];
}

export const AlertCard: React.FC<AlertCardProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <View className="mb-6">
      <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: '#0F172A' }} className="mb-3">
        Farming Weather Alerts
      </Text>

      {alerts.map((alert) => {
        // Icon mapping
        let Icon = AlertTriangle;
        if (alert.type === 'heat') Icon = Flame;
        else if (alert.type === 'wind') Icon = Wind;
        else if (alert.type === 'rain') Icon = CloudRain;
        else if (alert.level === 'danger') Icon = ShieldAlert;

        // Color mapping
        let bgStyle = 'bg-amber-50 border-amber-200';
        let textTitleColor = '#9a3412'; // amber-800
        let iconColor = CLIMATE_COLORS.warning;

        if (alert.level === 'danger') {
          bgStyle = 'bg-red-50 border-red-200';
          textTitleColor = '#991b1b'; // red-800
          iconColor = CLIMATE_COLORS.danger;
        } else if (alert.level === 'info') {
          bgStyle = 'bg-blue-50 border-blue-200';
          textTitleColor = '#075985'; // sky-800
          iconColor = CLIMATE_COLORS.info;
        }

        return (
          <View 
            key={alert.id}
            className={`p-4 rounded-3xl border mb-3 flex-row items-start gap-3 ${bgStyle}`}
          >
            <View className="mt-0.5">
              <Icon size={20} color={iconColor} />
            </View>
            <View className="flex-1">
              <Text 
                style={{ 
                  fontFamily: 'Inter', 
                  fontSize: 14, 
                  fontWeight: '800', 
                  color: textTitleColor 
                }}
              >
                {alert.title}
              </Text>
              <Text 
                style={{ 
                  fontFamily: 'Inter', 
                  fontSize: 12, 
                  fontWeight: '600', 
                  color: '#475569', 
                  lineHeight: 18,
                  marginTop: 4 
                }}
              >
                {alert.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
