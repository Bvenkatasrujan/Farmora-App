import React from 'react';
import { Text, Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, LucideIcon } from 'lucide-react-native';
import { FarmoraColors } from '../../constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: LucideIcon;
  showArrow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon: Icon,
  showArrow = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  };

  // Base configurations
  const borderRadius = 16; // 16px radius as per design.md

  const containerStyle: ViewStyle = {
    borderRadius,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    ...style,
  };

  const textStyle: TextStyle = {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  };

  if (variant === 'primary') {
    if (disabled) {
      containerStyle.backgroundColor = '#d4ddd0'; // surface-dim
      textStyle.color = '#3d4a3d'; // muted sage
    }
  } else if (variant === 'secondary') {
    containerStyle.backgroundColor = 'transparent';
    containerStyle.borderWidth = 1.5;
    containerStyle.borderColor = disabled ? '#d4ddd0' : FarmoraColors.primary;
    textStyle.color = disabled ? '#bccbb9' : FarmoraColors.primary;
  } else if (variant === 'ghost') {
    containerStyle.backgroundColor = 'transparent';
    containerStyle.borderWidth = 0;
    textStyle.color = disabled ? '#bccbb9' : FarmoraColors.primary;
  } else if (variant === 'danger') {
    containerStyle.backgroundColor = FarmoraColors.error;
    textStyle.color = '#ffffff';
  }

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? FarmoraColors.primary : '#ffffff'}
          size="small"
        />
      );
    }

    return (
      <React.Fragment>
        {Icon && <Icon size={18} color={textStyle.color as string} style={{ marginRight: 8 }} />}
        <Text style={textStyle}>{title}</Text>
        {showArrow && !Icon && (
          <ArrowRight
            size={18}
            color={textStyle.color as string}
            style={{ marginLeft: 8 }}
          />
        )}
      </React.Fragment>
    );
  };

  const shadowStyle = variant === 'primary' && !disabled ? {
    shadowColor: 'rgba(22, 101, 52, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  } : {};

  if (variant === 'primary' && !disabled) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle, shadowStyle, style]}
      >
        <LinearGradient
          colors={[FarmoraColors.primary, FarmoraColors.secondary]} // Primary Green to Dark Green
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={containerStyle}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[containerStyle, animatedStyle, shadowStyle, style]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};
