import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import UserAnalyticsChart from '../../components/analytics/UserAnalyticsChart';
import Card from '../../components/common/Card';
import theme from '../../theme';
import useTranslation from '../../hooks/useTranslation';
import { RootStackParamList } from '../../navigation/types';
import apiService from '../../services/api';

interface ActivityData {
  day: string;
  value: number;
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
  }>({
    dailyActivity: [],
    featureUsage: [],
    weeklyStats: [],
    mostActiveDay: '',
    mostUsedFeature: '',
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
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [t, currentLanguage]);
  
  // 获取分析洞察
  const [insights, setInsights] = useState<any>(null);
  
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const insightsData = await apiService.analytics.getAnalyticsInsights();
        if (insightsData && insightsData.insights) {
          setInsights(insightsData);
        }
      } catch (err) {
        console.error('Failed to load insights:', err);
      }
    };
    
    if (!loading && !error) {
      fetchInsights();
    }
  }, [loading, error]);
  
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
        
        <Card title={t('analytics.insights')} style={styles.card}>
          <View style={styles.insightsContainer}>
            <Text style={[styles.insightText, isDarkMode && styles.textDark]}>
              {t('analytics.mostActiveDay')}: {usageData.mostActiveDay}
            </Text>
            <Text style={[styles.insightText, isDarkMode && styles.textDark]}>
              {t('analytics.mostUsedFeature')}: {usageData.mostUsedFeature}
            </Text>
            
            {insights && insights.insights && insights.insights.map((insight: any, index: number) => (
              <Text key={index} style={[styles.insightText, isDarkMode && styles.textDark]}>
                {insight.title}: {insight.description}
              </Text>
            ))}
            
            <Text style={[styles.insightText, isDarkMode && styles.textDark]}>
              {t('analytics.progressTrend')}: {t('analytics.upward')}
            </Text>
          </View>
        </Card>
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
  card: {
    marginBottom: theme.spacing.md,
  },
  insightsContainer: {
    padding: theme.spacing.md,
  },
  insightText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  textDark: {
    color: theme.dark.colors.textPrimary,
  },
});

export default UserAnalyticsScreen; 