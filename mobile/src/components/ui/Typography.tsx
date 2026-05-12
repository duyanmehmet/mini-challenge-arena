import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography as TypographyConstants } from '../../constants/typography';
import { useSettingsStore } from '../../store/settingsStore';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'score';
  style?: TextStyle;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  style,
  color,
  align = 'left',
}) => {
  const { theme } = useSettingsStore();
  const colors = Colors[theme];

  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: TypographyConstants.sizes.xl,
          fontFamily: 'Nunito-Bold',
        };
      case 'h2':
        return {
          fontSize: TypographyConstants.sizes.lg,
          fontFamily: 'Nunito-SemiBold',
        };
      case 'h3':
        return {
          fontSize: TypographyConstants.sizes.md,
          fontFamily: 'Nunito-SemiBold',
        };
      case 'score':
        return {
          fontSize: TypographyConstants.sizes.xxl,
          fontFamily: 'Nunito-ExtraBold',
        };
      case 'small':
        return {
          fontSize: TypographyConstants.sizes.xs,
          fontFamily: 'Nunito-Regular',
        };
      default:
        return {
          fontSize: TypographyConstants.sizes.md,
          fontFamily: 'Nunito-Regular',
        };
    }
  };

  return (
    <Text style={[
      getVariantStyle(),
      { color: color || colors.textPrimary, textAlign: align },
      style
    ]}>
      {children}
    </Text>
  );
};
