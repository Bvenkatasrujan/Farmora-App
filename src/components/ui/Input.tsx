import React, { useState, memo } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { LucideIcon, Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const InputComponent: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  secureTextEntry,
  style: propStyle,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSecure = secureTextEntry && !isPasswordVisible;

  // Keep border color static to prevent layout/drawing updates that steal focus on Android
  const borderColor = error ? '#ba1a1a' : '#E2E8F0';
  const iconColor = error ? '#ba1a1a' : '#94A3B8';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View
        style={[
          styles.inputRow,
          { 
            borderColor,
          },
        ]}
      >
        {Icon && (
          <Icon
            size={20}
            color={iconColor}
            style={{ marginRight: 10 }}
          />
        )}
        
        <TextInput
          secureTextEntry={isSecure}
          placeholderTextColor="#94A3B8"
          style={styles.textInput}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={{ padding: 4 }}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color="#94A3B8" />
            ) : (
              <Eye size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

export const Input = memo(InputComponent);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.2,
    color: '#1e293b',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  textInput: {
    flex: 1,
    color: '#1e293b',
    fontSize: 14,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    height: '100%',
    ...Platform.select({
      android: { paddingTop: 2 },
      ios: { paddingTop: 0 },
    }),
  },
  errorText: {
    color: '#ba1a1a',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
});
