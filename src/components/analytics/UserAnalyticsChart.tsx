import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme, Platform } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import theme from '../../theme';
import useTranslation from '../../hooks/useTranslation';

interface ActivityData {
  day: string;
  value: number;
}

interface UserAnalyticsChartProps {
  title: string;
  data: ActivityData[];
  color?: string;
  unit?: string;
}

const UserAnalyticsChart: React.FC<UserAnalyticsChartProps> = ({
  title,
  data,
  color = theme.colors.primary,
  unit = '',
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width - (theme.spacing.md * 2);
  
  const chartData = {
    labels: data.map(item => item.day),
    datasets: [
      {
        data: data.map(item => item.value),
        color: (opacity = 1) => color, // 颜色
        strokeWidth: 2, // 线宽
      },
    ],
  };
  
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? theme.dark.colors.cardBackground : theme.colors.cardBackground,
    backgroundGradientTo: isDarkMode ? theme.dark.colors.cardBackground : theme.colors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary,
    style: {
      borderRadius: theme.borderRadius.md,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: color,
    },
    barPercentage: 0.6,
  };
  
  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>{title}</Text>
      
      <BarChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        yAxisSuffix={unit ? ` ${unit}` : ''}
        verticalLabelRotation={30}
        fromZero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...Platform.select({
      ios: theme.shadows.ios.sm,
      android: theme.shadows.android.sm,
      default: {
        elevation: 2,
      },
    }),
  },
  containerDark: {
    backgroundColor: theme.dark.colors.cardBackground,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  titleDark: {
    color: theme.dark.colors.textPrimary,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
});

export default UserAnalyticsChart; 