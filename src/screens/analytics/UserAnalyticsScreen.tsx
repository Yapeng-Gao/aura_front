import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import UserAnalyticsChart from '../../components/analytics/UserAnalyticsChart';
import AnalyticsCard from '../../components/analytics/AnalyticsCard';
import AnalyticsInsightCard from '../../components/analytics/AnalyticsInsightCard';
import theme from '../../theme';
import useTranslation from '../../hooks/useTranslation';
import { RootStackParamList } from '../../navigation/types';
import apiService from '../../services/api';

interface ActivityData {
  day: string;
  value: number;
}

interface InsightData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

type AnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const UserAnalyticsScreen: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const navigation = useNavigation<AnalyticsScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 数据状态
  const [usageData, setUsageData] = useState<{
    dailyActivity: ActivityData[];
    featureUsage: ActivityData[];
    weeklyStats: ActivityData[];
    mostActiveDay: string;
    mostUsedFeature: string;
    totalTimeSpent: number;
    growthRate: number;
    averageDailyUsage: number;
  }>({
    dailyActivity: [],
    featureUsage: [],
    weeklyStats: [],
    mostActiveDay: '',
    mostUsedFeature: '',
    totalTimeSpent: 0,
    growthRate: 0,
    averageDailyUsage: 0,
  });
  
  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 使用真实API获取数据
        const usageStats = await apiService.analytics.getUsageStats('week');
        
        // 将API返回的数据转换为组件所需格式
        if (usageStats) {
          setUsageData({
            dailyActivity: usageStats.dailyActivity || [],
            featureUsage: usageStats.featureUsage || [],
            weeklyStats: usageStats.weeklyStats || [],
            mostActiveDay: usageStats.mostActiveDay || t('common.friday'),
            mostUsedFeature: usageStats.mostUsedFeature || t('analytics.assistant'),
            totalTimeSpent: usageStats.totalTimeSpent || 0,
            growthRate: usageStats.growthRate || 0,
            averageDailyUsage: usageStats.averageDailyUsage || 0,
          });
        }
        
        setError(null);
      } catch (err) {
        console.error(t('analytics.loadErrorLog'), err);
        setError(t('analytics.loadError'));
        
        // 如果API调用失败，使用模拟数据
        const mockDailyActivity = [
          { day: t('common.monday'), value: 25 },
          { day: t('common.tuesday'), value: 38 },
          { day: t('common.wednesday'), value: 42 },
          { day: t('common.thursday'), value: 35 },
          { day: t('common.friday'), value: 50 },
          { day: t('common.saturday'), value: 32 },
          { day: t('common.sunday'), value: 28 },
        ];
        
        const mockFeatureUsage = [
          { day: t('analytics.assistant'), value: 45 },
          { day: t('analytics.schedule'), value: 32 },
          { day: t('analytics.notes'), value: 28 },
          { day: t('analytics.devices'), value: 15 },
          { day: t('analytics.creative'), value: 22 },
        ];
        
        const mockWeeklyStats = [
          { day: t('analytics.week1'), value: 158 },
          { day: t('analytics.week2'), value: 185 },
          { day: t('analytics.week3'), value: 203 },
          { day: t('analytics.week4'), value: 250 },
        ];
        
        setUsageData({
          dailyActivity: mockDailyActivity,
          featureUsage: mockFeatureUsage,
          weeklyStats: mockWeeklyStats,
          mostActiveDay: t('common.friday'),
          mostUsedFeature: t('analytics.assistant'),
          totalTimeSpent: 250,
          growthRate: 12,
          averageDailyUsage: 35,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [t, currentLanguage]);
  
  // 获取分析洞察
  const [insightsData, setInsightsData] = useState<InsightData[]>([]);
  
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const insightsResult = await apiService.analytics.getAnalyticsInsights();
        if (insightsResult && insightsResult.insights) {
          setInsightsData(insightsResult.insights);
        } else {
          // 使用模拟数据
          setInsightsData([
            {
              id: 'insight1',
              title: t('analytics.productivityTrend'),
              description: t('analytics.productivityDescription'),
              icon: 'trending-up',
              color: theme.colors.success,
            },
            {
              id: 'insight2',
              title: t('analytics.usagePattern'),
              description: t('analytics.usagePatternDescription'),
              icon: 'time-outline',
              color: theme.colors.info,
            },
            {
              id: 'insight3',
              title: t('analytics.suggestion'),
              description: t('analytics.suggestionDescription'),
              icon: 'bulb-outline',
              color: theme.colors.warning,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load insights:', err);
        // 使用模拟数据
        setInsightsData([
          {
            id: 'insight1',
            title: t('analytics.productivityTrend'),
            description: t('analytics.productivityDescription'),
            icon: 'trending-up',
            color: theme.colors.success,
          },
          {
            id: 'insight2',
            title: t('analytics.usagePattern'),
            description: t('analytics.usagePatternDescription'),
            icon: 'time-outline',
            color: theme.colors.info,
          },
          {
            id: 'insight3',
            title: t('analytics.suggestion'),
            description: t('analytics.suggestionDescription'),
            icon: 'bulb-outline',
            color: theme.colors.warning,
          },
        ]);
      }
    };
    
    if (!loading && !error) {
      fetchInsights();
    }
  }, [loading, error, t]);
  
  if (loading) {
    return (
      <ScreenContainer
        title={t('analytics.title')}
        backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
        showBackButton
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDarkMode && styles.textDark]}>
            {t('common.loading')}
          </Text>
        </View>
      </ScreenContainer>
    );
  }
  
  if (error) {
    return (
      <ScreenContainer
        title={t('analytics.title')}
        backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
        showBackButton
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }
  
  return (
    <ScreenContainer
      title={t('analytics.title')}
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      showBackButton
    >
      <ScrollView style={styles.container}>
        {/* 核心指标卡片 */}
        <View style={styles.metricsContainer}>
          <AnalyticsCard
            title={t('analytics.totalUsage')}
            value={usageData.totalTimeSpent}
            unit={t('analytics.minutes')}
            icon="time-outline"
            color={theme.colors.primary}
            percentage={usageData.growthRate}
            trend="up"
            style={styles.metricCard}
          />
          
          <AnalyticsCard
            title={t('analytics.dailyAverage')}
            value={usageData.averageDailyUsage}
            unit={t('analytics.minutes')}
            icon="calendar-outline"
            color={theme.colors.info}
            style={styles.metricCard}
          />
        </View>
        
        {/* 图表 */}
        <UserAnalyticsChart
          title={t('analytics.dailyActivity')}
          data={usageData.dailyActivity}
          color={theme.colors.primary}
          unit={t('analytics.minutes')}
        />
        
        <UserAnalyticsChart
          title={t('analytics.weeklyStats')}
          data={usageData.weeklyStats}
          color={theme.colors.info}
          unit={t('analytics.minutes')}
        />
        
        <UserAnalyticsChart
          title={t('analytics.trendingFeatures')}
          data={usageData.featureUsage}
          color={theme.colors.success}
          unit={t('analytics.times')}
        />
        
        {/* 洞察卡片 */}
        <AnalyticsInsightCard
          title={t('analytics.insights')}
          insights={insightsData}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  textDark: {
    color: theme.dark.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

export default UserAnalyticsScreen; 