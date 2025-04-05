import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import theme from '../../theme';

interface BadgeProps {
  text: string;
  color?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  color = theme.colors.primary,
  textColor = '#FFFFFF',
  size = 'small',
  style,
  textStyle,
}) => {
  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 10,
    },
    medium: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 6,
      fontSize: 12,
    },
    large: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
      fontSize: 14,
    },
  };

  const badgeStyle = {
    backgroundColor: color,
    paddingHorizontal: sizeStyles[size].paddingHorizontal,
    paddingVertical: sizeStyles[size].paddingVertical,
    borderRadius: sizeStyles[size].borderRadius,
  };

  const textSizeStyle = {
    fontSize: sizeStyles[size].fontSize,
  };

  return (
    <View style={[styles.badge, badgeStyle, style]}>
      <Text style={[styles.text, { color: textColor }, textSizeStyle, textStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
});

export default Badge; 