import React from 'react';
import { View, Text, StyleSheet, ViewStyle, useColorScheme, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  style?: ViewStyle;
  onPress?: () => void;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  unit,
  icon = 'analytics-outline',
  color = theme.colors.primary,
  percentage,
  trend,
  style,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const getTrendIcon = () => {
    if (!trend) return null;
    
    let iconName: string;
    let iconColor: string;
    
    switch (trend) {
      case 'up':
        iconName = 'arrow-up-outline';
        iconColor = theme.colors.success;
        break;
      case 'down':
        iconName = 'arrow-down-outline';
        iconColor = theme.colors.error;
        break;
      default:
        iconName = 'remove-outline';
        iconColor = theme.colors.textSecondary;
    }
    
    return (
      <View style={styles.trendContainer}>
        <Ionicons name={iconName as any} size={16} color={iconColor} />
        {percentage !== undefined && (
          <Text style={[styles.percentage, { color: iconColor }]}>
            {percentage}%
          </Text>
        )}
      </View>
    );
  };

  const CardContent = () => (
    <View style={[
      styles.container, 
      isDarkMode && styles.containerDark,
      style
    ]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          {title}
        </Text>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, isDarkMode && styles.valueDark]}>
          {value}
          {unit && <Text style={styles.unit}> {unit}</Text>}
        </Text>
        {getTrendIcon()}
      </View>
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <CardContent />
      </TouchableOpacity>
    );
  }
  
  return <CardContent />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...(Platform.OS === 'ios' ? theme.shadows.ios.sm :
       Platform.OS === 'android' ? theme.shadows.android.sm :
       { elevation: 2 }),
  },
  containerDark: {
    backgroundColor: theme.dark.colors.cardBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  titleDark: {
    color: theme.dark.colors.textSecondary,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: theme.typography.fontSize.xxl,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  valueDark: {
    color: theme.dark.colors.textPrimary,
  },
  unit: {
    fontSize: theme.typography.fontSize.md,
    opacity: 0.7,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentage: {
    fontSize: theme.typography.fontSize.sm,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
});

export default AnalyticsCard;