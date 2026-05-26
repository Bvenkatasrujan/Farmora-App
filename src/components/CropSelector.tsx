import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { cropCategories } from '../constants/crops';
import { marketStyles } from '../styles/marketStyles';

interface CropSelectorProps {
  selectedCrop: string | null;
  onSelectCrop: (crop: string) => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
}) => {
  return (
    <View style={{ gap: 14 }}>
      {cropCategories.map((categoryObj) => (
        <View key={categoryObj.category} style={{ gap: 6 }}>
          <Text style={{ 
            fontFamily: 'Inter', 
            fontSize: 11, 
            fontWeight: '800', 
            color: '#1B5E20', 
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            {categoryObj.category}
          </Text>
          
          <View style={marketStyles.cropGrid}>
            {categoryObj.items.map((crop) => {
              const isSelected = selectedCrop === crop;
              return (
                <TouchableOpacity
                  key={crop}
                  activeOpacity={0.7}
                  onPress={() => onSelectCrop(crop)}
                  style={[
                    marketStyles.cropTag,
                    isSelected && marketStyles.cropTagSelected,
                  ]}
                >
                  <Text
                    style={[
                      marketStyles.cropTagText,
                      isSelected && marketStyles.cropTagTextSelected,
                    ]}
                  >
                    {crop}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};
