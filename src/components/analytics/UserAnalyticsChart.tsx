import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Card from '../common/Card';
import theme from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

interface ActivityData {
  day: string;
  value: number;
}

interface UserAnalyticsChartProps {
  title: string;
  data: ActivityData[];
  color: string;
  unit: string;
  // 可选的图表类型，默认为柱状图
  chartType?: 'bar' | 'line';
}

const UserAnalyticsChart: React.FC<UserAnalyticsChartProps> = ({ 
  title, 
  data, 
  color, 
  unit,
  chartType = 'bar'
}) => {
  const { isDarkMode } = useTheme();
  const screenWidth = Dimensions.get('window').width - 40; // 减去边距

  // 准备图表数据
  const chartData = {
    labels: data.map(item => item.day),
    datasets: [
      {
        data: data.map(item => item.value),
        color: (opacity = 1) => color, 
        strokeWidth: 2
      }
    ],
    legend: [unit]
  };

  // 图表配置
  const chartConfig = {
    backgroundColor: isDarkMode ? theme.dark.colors.cardBackground : theme.colors.surface,
    backgroundGradientFrom: isDarkMode ? theme.dark.colors.cardBackground : theme.colors.surface,
    backgroundGradientTo: isDarkMode ? theme.dark.colors.cardBackground : theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${color.replace(/[^\d,]/g, '') || '0,0,255'}, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: color
    }
  };

  return (
    <Card 
      title={title} 
      style={styles.card}
      isDarkMode={isDarkMode}
    >
      <View style={styles.chartContainer}>
        {chartType === 'bar' ? (
          <BarChart
            data={chartData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix={` ${unit}`}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
        ) : (
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix={` ${unit}`}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
});

export default UserAnalyticsChart; 