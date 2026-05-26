import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, View } from 'react-native';
import { marketStyles, marketColors } from '../styles/marketStyles';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  icon,
}) => {
  const isBtnDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isBtnDisabled}
      style={[
        marketStyles.btnPrimary,
        isBtnDisabled && marketStyles.btnPrimaryDisabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isBtnDisabled }}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon && <View style={marketStyles.btnIcon}>{icon}</View>}
          <Text style={marketStyles.btnPrimaryText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

