import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import UserAnalyticsChart from '../../components/analytics/UserAnalyticsChart';
import Card from '../../components/common/Card';
import theme from '../../theme';
import useTranslation from '../../hooks/useTranslation';
import { RootStackParamList } from '../../navigation/types';
import apiService from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

interface ActivityData {
  day: string;
  value: number;
}

interface StatsData {
  title: string;
  value: string;
  icon: string;
  color: string;
}

type AnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const UserAnalyticsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<AnalyticsScreenNavigationProp>();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 示例数据
  const [usageData, setUsageData] = useState<{
    dailyActivity: ActivityData[];
    featureUsage: ActivityData[];
    weeklyStats: ActivityData[];
    monthlyStats: ActivityData[];
    keyStats: StatsData[];
  }>({
    dailyActivity: [],
    featureUsage: [],
    weeklyStats: [],
    monthlyStats: [],
    keyStats: [],
  });
  
  // 模拟获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 尝试从API获取数据
        try {
          const analyticsData = await apiService.analytics.getUsageStats('month');
          // 如果API返回了数据，则使用API数据
          if (analyticsData) {
            console.log('使用API返回的数据');
            // 处理API返回的数据...
            return;
          }
        } catch (apiError) {
          console.log('API获取数据失败，使用模拟数据');
          // API调用失败，继续使用模拟数据
        }
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据 - 日活跃度
        const mockDailyActivity = [
          { day: '周一', value: 25 },
          { day: '周二', value: 38 },
          { day: '周三', value: 42 },
          { day: '周四', value: 35 },
          { day: '周五', value: 50 },
          { day: '周六', value: 32 },
          { day: '周日', value: 28 },
        ];
        
        // 模拟数据 - 功能使用频率
        const mockFeatureUsage = [
          { day: '智能助手', value: 45 },
          { day: '日程安排', value: 32 },
          { day: '笔记', value: 28 },
          { day: '智能家居', value: 15 },
          { day: '创意工具', value: 22 },
        ];
        
        // 模拟数据 - 周统计
        const mockWeeklyStats = [
          { day: '第1周', value: 158 },
          { day: '第2周', value: 185 },
          { day: '第3周', value: 203 },
          { day: '第4周', value: 250 },
        ];
        
        // 模拟数据 - 月统计
        const mockMonthlyStats = [
          { day: '1月', value: 720 },
          { day: '2月', value: 680 },
          { day: '3月', value: 750 },
          { day: '4月', value: 800 },
          { day: '5月', value: 830 },
          { day: '6月', value: 920 },
        ];
        
        // 模拟数据 - 关键统计数据
        const mockKeyStats = [
          { 
            title: '总使用时长', 
            value: '42小时', 
            icon: 'time-outline',
            color: theme.colors.primary
          },
          { 
            title: '日均使用', 
            value: '86分钟', 
            icon: 'calendar-outline',
            color: theme.colors.info
          },
          { 
            title: '完成任务', 
            value: '128项', 
            icon: 'checkmark-circle-outline',
            color: theme.colors.success
          },
          { 
            title: '效率提升', 
            value: '23%', 
            icon: 'trending-up-outline',
            color: theme.colors.warning
          },
        ];
        
        setUsageData({
          dailyActivity: mockDailyActivity,
          featureUsage: mockFeatureUsage,
          weeklyStats: mockWeeklyStats,
          monthlyStats: mockMonthlyStats,
          keyStats: mockKeyStats,
        });
        
        setError(null);
      } catch (err) {
        console.error('加载分析数据失败:', err);
        setError(t('analytics.loadError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [t]);
  
  // 加载状态
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
  
  // 错误状态
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
  
  // 正常显示数据
  return (
    <ScreenContainer
      title={t('analytics.title')}
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      showBackButton
    >
      <ScrollView style={styles.container}>
        {/* 关键统计数据卡片 */}
        <Card title="使用统计" style={styles.card} isDarkMode={isDarkMode}>
          <View style={styles.statsGrid}>
            {usageData.keyStats.map((stat, index) => (
              <View key={index} style={[
                styles.statItem, 
                {backgroundColor: isDarkMode ? theme.dark.colors.surface : theme.colors.background}
              ]}>
                <Icon name={stat.icon} size={24} color={stat.color} style={styles.statIcon} />
                <Text style={[styles.statValue, isDarkMode && styles.textDark]}>{stat.value}</Text>
                <Text style={[styles.statTitle, isDarkMode && styles.textSecondaryDark]}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </Card>
        
        {/* 日活跃度图表 */}
        <UserAnalyticsChart
          title="每日活跃度"
          data={usageData.dailyActivity}
          color={theme.colors.primary}
          unit="分钟"
        />
        
        {/* 周统计图表 */}
        <UserAnalyticsChart
          title="每周使用统计"
          data={usageData.weeklyStats}
          color={theme.colors.info}
          unit="分钟"
        />
        
        {/* 功能使用频率图表 */}
        <UserAnalyticsChart
          title="功能使用频率"
          data={usageData.featureUsage}
          color={theme.colors.success}
          unit="次"
        />
        
        {/* 月度趋势图表 - 使用折线图 */}
        <UserAnalyticsChart
          title="月度使用趋势"
          data={usageData.monthlyStats}
          color={theme.colors.warning}
          unit="分钟"
          chartType="line"
        />
        
        {/* 分析洞察卡片 */}
        <Card title="数据洞察" style={styles.card} isDarkMode={isDarkMode}>
          <View style={styles.insightsContainer}>
            <View style={styles.insightItem}>
              <Icon name="stats-chart" size={20} color={theme.colors.primary} style={styles.insightIcon} />
              <View style={styles.insightContent}>
                <Text style={[styles.insightText, isDarkMode && styles.textDark]}>
                  周五是您最活跃的一天，平均使用时长超过其他日期20%
                </Text>
              </View>
            </View>
            
            <View style={styles.insightItem}>
              <Icon name="bulb-outline" size={20} color={theme.colors.warning} style={styles.insightIcon} />
              <View style={styles.insightContent}>
                <Text style={[styles.insightText, isDarkMode && styles.textDark]}>
                  您在过去30天内的应用使用时间增长了15%，效率提升显著
                </Text>
              </View>
            </View>
            
            <View style={styles.insightItem}>
              <Icon name="star-outline" size={20} color={theme.colors.success} style={styles.insightIcon} />
              <View style={styles.insightContent}>
                <Text style={[styles.insightText, isDarkMode && styles.textDark]}>
                  智能助手是您最常使用的功能，为您节省了约12小时的工作时间
                </Text>
              </View>
            </View>
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
    padding: theme.spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  insightIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
  },
  statItem: {
    width: '48%',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  textDark: {
    color: theme.dark.colors.textPrimary,
  },
  textSecondaryDark: {
    color: theme.dark.colors.textSecondary,
  },
});

export default UserAnalyticsScreen; 