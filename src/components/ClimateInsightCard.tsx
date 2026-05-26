import React from 'react';
import { View, Text } from 'react-native';
import { Lightbulb, Leaf, Droplet, CheckCircle } from 'lucide-react-native';
import { ClimateInsight } from '../types/climate';
import { CLIMATE_COLORS } from '../constants/climateConfig';

interface ClimateInsightCardProps {
  insights: ClimateInsight[];
}

export const ClimateInsightCard: React.FC<ClimateInsightCardProps> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <View className="mb-6">
      <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: '#0F172A' }} className="mb-3">
        Smart Farming Insights
      </Text>

      {insights.map((insight) => {
        // Icon and styling mapping
        let Icon = Lightbulb;
        let iconColor = CLIMATE_COLORS.primary;
        let badgeText = 'FARMING ADVISORY';
        let bgStyle = 'bg-emerald-50/50 border-emerald-100/60';

        if (insight.category === 'irrigation') {
          Icon = Droplet;
          iconColor = '#0284c7';
          badgeText = 'IRRIGATION ADVISOR';
          bgStyle = 'bg-sky-50/50 border-sky-100/60';
        } else if (insight.category === 'crop') {
          Icon = Leaf;
          iconColor = '#059669';
          badgeText = 'CROP ADVISOR';
          bgStyle = 'bg-emerald-50/50 border-emerald-100/60';
        }

        if (insight.level === 'warning') {
          bgStyle += ' border-amber-200';
        } else if (insight.level === 'success') {
          Icon = CheckCircle;
          iconColor = CLIMATE_COLORS.success;
        }

        return (
          <View 
            key={insight.id}
            className={`p-5 rounded-3xl border mb-3 shadow-sm bg-white ${bgStyle}`}
          >
            {/* Header Badge */}
            <View className="flex-row items-center gap-2 mb-2">
              <Icon size={16} color={iconColor} />
              <Text 
                style={{ 
                  fontFamily: 'Inter', 
                  fontSize: 11, 
                  fontWeight: '800', 
                  color: iconColor,
                  letterSpacing: 0.5
                }}
              >
                {badgeText}
              </Text>
            </View>

            {/* Title */}
            <Text 
              style={{ 
                fontFamily: 'Inter', 
                fontSize: 14, 
                fontWeight: '800', 
                color: '#1E293B' 
              }}
            >
              {insight.title}
            </Text>

            {/* Description */}
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
              {insight.description}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
