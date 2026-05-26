import React, { useEffect } from 'react';
import { TextProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTranslation } from '../hooks/useTranslation';

interface Props extends TextProps {
  text: string;
}

export default function TranslatedText({ text, style, ...props }: Props) {
  const { t } = useTranslation();
  const translatedText = t(text);

  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = 0.3;
    opacity.value = withTiming(1, { duration: 350 });
  }, [translatedText]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[style, animatedStyle]} {...props}>
      {translatedText}
    </Animated.Text>
  );
}
