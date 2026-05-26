import React from 'react';
import { View, Pressable, ViewStyle, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { FarmoraColors } from '../../constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
  variant?: 'glass' | 'white' | 'outlined' | 'gradient';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  className = '',
  style,
  variant = 'white',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 10, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  };

  // Base configurations
  const borderRadius = 24; // 24px radius (2xl) as per design.md

  let baseStyle = 'p-5 mb-4';
  let cardStyle: ViewStyle = {
    borderRadius,
    borderWidth: 1,
    borderColor: 'transparent',
    ...style,
  };

  // Soft diffused shadows tinted with Dark Green (rgba(22, 101, 52, 0.08))
  const shadowStyle: ViewStyle = Platform.select({
    ios: {
      shadowColor: '#166534',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 15,
    },
    android: {
      shadowColor: '#166534',
      elevation: 3,
    },
    default: {},
  });
  
  if (variant === 'glass') {
    // Glassmorphic: backdrop blur-like styling, 70% opaque white background, border 1px solid white 40%
    baseStyle += ' bg-white/70';
    cardStyle.borderColor = 'rgba(255, 255, 255, 0.4)';
    Object.assign(cardStyle, shadowStyle);
  } else if (variant === 'white') {
    // Primary card: pure white, soft shadow
    baseStyle += ' bg-white';
    cardStyle.borderColor = '#edf6ea'; // soft outline
    Object.assign(cardStyle, shadowStyle);
  } else if (variant === 'outlined') {
    baseStyle += ' bg-transparent';
    cardStyle.borderColor = FarmoraColors.border;
  } else if (variant === 'gradient') {
    // Primary green container background
    baseStyle += ' bg-emerald-50/50';
    cardStyle.borderColor = 'rgba(0, 110, 47, 0.1)';
  }

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, animatedStyle]}
        className={`${baseStyle} ${className}`}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={cardStyle} className={`${baseStyle} ${className}`}>
      {children}
    </View>
  );
};
