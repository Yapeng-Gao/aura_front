import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import Card from './common/Card';
import theme from '../theme';
import useTranslation from '../hooks/useTranslation';

interface DataPoint {
  day: string;
  value: number;
}

interface UserAnalyticsChartProps {
  title: string;
  data: DataPoint[];
  maxValue?: number;
  color?: string;
  unit?: string;
}

// 定义图表高度常量
const CHART_HEIGHT = 140;

const UserAnalyticsChart: React.FC<UserAnalyticsChartProps> = ({
  title,
  data,
  maxValue: propMaxValue,
  color = theme.colors.primary,
  unit = ''
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // 计算最大值，如果没有提供则从数据中找出
  const maxValue = propMaxValue || Math.max(...data.map(point => point.value), 1);
  
  // 计算图表宽度 (根据屏幕宽度减去边距)
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (theme.spacing.md * 4);
  
  // 计算每个数据点的宽度
  const pointWidth = chartWidth / data.length;
  
  return (
    <Card 
      title={title} 
      style={styles.card}
    >
      <View style={styles.container}>
        <View style={styles.chartContainer}>
          {/* Y轴标签 */}
          <View style={styles.yAxis}>
            <Text style={[styles.yAxisLabel, isDarkMode && styles.textDark]}>
              {maxValue}{unit}
            </Text>
            <Text style={[styles.yAxisLabel, isDarkMode && styles.textDark]}>
              {Math.floor(maxValue / 2)}{unit}
            </Text>
            <Text style={[styles.yAxisLabel, isDarkMode && styles.textDark]}>
              0{unit}
            </Text>
          </View>
          
          <View style={styles.chartArea}>
            {/* 柱状图/折线图 */}
            <View style={styles.chart}>
              {data.map((point, index) => {
                const barHeight = (point.value / maxValue) * CHART_HEIGHT;
                return (
                  <View key={index} style={[styles.barContainer, { width: pointWidth - 4 }]}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: barHeight, 
                          backgroundColor: color 
                        }
                      ]} 
                    />
                  </View>
                );
              })}
            </View>
            
            {/* X轴标签 */}
            <View style={styles.xAxis}>
              {data.map((point, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.xAxisLabel, 
                    { width: pointWidth },
                    isDarkMode && styles.textDark
                  ]}
                >
                  {point.day}
                </Text>
              ))}
            </View>
          </View>
        </View>
        
        {/* 图表总结 */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color }, isDarkMode && styles.textLightDark]}>
              {data.reduce((sum, point) => sum + point.value, 0)}{unit}
            </Text>
            <Text style={[styles.summaryLabel, isDarkMode && styles.textDark]}>
              {t('analytics.total')}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color }, isDarkMode && styles.textLightDark]}>
              {Math.max(...data.map(point => point.value))}{unit}
            </Text>
            <Text style={[styles.summaryLabel, isDarkMode && styles.textDark]}>
              {t('analytics.max')}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color }, isDarkMode && styles.textLightDark]}>
              {Math.round(data.reduce((sum, point) => sum + point.value, 0) / data.length)}{unit}
            </Text>
            <Text style={[styles.summaryLabel, isDarkMode && styles.textDark]}>
              {t('analytics.avg')}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  container: {
    padding: theme.spacing.sm,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  yAxis: {
    width: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: theme.spacing.xs,
  },
  yAxisLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  chartArea: {
    flex: 1,
  },
  chart: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  barContainer: {
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  xAxis: {
    flexDirection: 'row',
    height: 20,
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  textDark: {
    color: theme.dark.colors.textSecondary,
  },
  textLightDark: {
    opacity: 0.9,
  },
});

export default UserAnalyticsChart; 