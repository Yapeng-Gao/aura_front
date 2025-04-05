import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import useDarkMode from '../../hooks/useDarkMode';
import theme from '../../theme';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import apiService from '../../services/api';

const SystemStatusScreen: React.FC = () => {
  const { t } = useTranslation();
  const isDarkMode = useDarkMode();
  
  // 状态
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 加载系统健康状态
  const loadSystemHealth = useCallback(async () => {
    try {
      const healthData = await apiService.iot.getSystemHealth();
      setHealth(healthData);
    } catch (error) {
      console.error('获取系统健康状态失败:', error);
      Alert.alert(
        t('common.error'),
        t('iot.system.healthError'),
        [{ text: t('common.confirm') }]
      );
    }
  }, [t]);
  
  // 加载系统指标
  const loadSystemMetrics = useCallback(async () => {
    try {
      const metricsData = await apiService.iot.getSystemMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('获取系统指标失败:', error);
      Alert.alert(
        t('common.error'),
        t('iot.system.metricsError'),
        [{ text: t('common.confirm') }]
      );
    }
  }, [t]);
  
  // 加载所有数据
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadSystemHealth(),
      loadSystemMetrics()
    ]);
    setIsLoading(false);
    setIsRefreshing(false);
  }, [loadSystemHealth, loadSystemMetrics]);
  
  // 首次加载和页面聚焦时获取数据
  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );
  
  // 下拉刷新
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAllData();
  };
  
  // 渲染状态图标
  const renderStatusIcon = (status: string) => {
    if (status === 'healthy' || status === 'connected' || status === 'available' || status === 'operational') {
      return <Icon name="checkmark-circle" size={20} color={theme.colors.success} />;
    } else if (status === 'degraded' || status === 'warning') {
      return <Icon name="warning" size={20} color={theme.colors.warning} />;
    } else {
      return <Icon name="close-circle" size={20} color={theme.colors.error} />;
    }
  };
  
  // 渲染健康状态卡片
  const renderHealthCard = () => {
    if (!health) return null;
    
    return (
      <Card
        title={t('iot.system.healthStatus')}
        icon="heart-outline"
        style={styles.card}
        isDarkMode={isDarkMode}
      >
        <View style={styles.statusContainer}>
          {renderStatusIcon(health.status)}
          <Text style={[
            styles.statusText,
            isDarkMode && { color: theme.dark.colors.textPrimary }
          ]}>
            {health.status === 'healthy' ? t('iot.system.statusHealthy') : 
              health.status === 'degraded' ? t('iot.system.statusDegraded') : 
              t('iot.system.statusUnhealthy')}
          </Text>
        </View>
        
        <Text style={[
          styles.sectionTitle,
          isDarkMode && { color: theme.dark.colors.textPrimary }
        ]}>
          {t('iot.system.components')}
        </Text>
        
        {/* 数据库 */}
        <Text style={[
          styles.componentTitle,
          isDarkMode && { color: theme.dark.colors.textPrimary }
        ]}>
          {t('iot.system.database')}
        </Text>
        
        <View style={styles.componentContainer}>
          <View style={styles.componentItem}>
            {renderStatusIcon(health.components.database.postgres.status)}
            <Text style={[
              styles.componentText,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              PostgreSQL
            </Text>
          </View>
          
          <View style={styles.componentItem}>
            {renderStatusIcon(health.components.database.mongodb.status)}
            <Text style={[
              styles.componentText,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              MongoDB
            </Text>
          </View>
        </View>
        
        {/* 协议 */}
        <Text style={[
          styles.componentTitle,
          isDarkMode && { color: theme.dark.colors.textPrimary }
        ]}>
          {t('iot.system.protocols')}
        </Text>
        
        <View style={styles.componentContainer}>
          {Object.entries(health.components.protocols).map(([key, value]: [string, any]) => (
            <View key={key} style={styles.componentItem}>
              {renderStatusIcon(value.status)}
              <Text style={[
                styles.componentText,
                isDarkMode && { color: theme.dark.colors.textSecondary }
              ]}>
                {key.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
        
        {/* 服务 */}
        <Text style={[
          styles.componentTitle,
          isDarkMode && { color: theme.dark.colors.textPrimary }
        ]}>
          {t('iot.system.services')}
        </Text>
        
        <View style={styles.componentContainer}>
          {Object.entries(health.components.services).map(([key, value]: [string, any]) => (
            <View key={key} style={styles.componentItem}>
              {renderStatusIcon(value.status)}
              <Text style={[
                styles.componentText,
                isDarkMode && { color: theme.dark.colors.textSecondary }
              ]}>
                {t(`iot.system.${key}`)}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };
  
  // 渲染指标卡片
  const renderMetricsCard = () => {
    if (!metrics) return null;
    
    return (
      <Card
        title={t('iot.system.metrics')}
        icon="stats-chart-outline"
        style={styles.card}
        isDarkMode={isDarkMode}
      >
        {/* 设备统计 */}
        <Text style={[
          styles.sectionTitle,
          isDarkMode && { color: theme.dark.colors.textPrimary }
        ]}>
          {t('iot.system.devices')}
        </Text>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              isDarkMode && { color: theme.dark.colors.textPrimary }
            ]}>
              {metrics.devices.total}
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.totalDevices')}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              { color: theme.colors.success },
              isDarkMode && { color: theme.dark.colors.success }
            ]}>
              {metrics.devices.online}
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.onlineDevices')}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              { color: theme.colors.textSecondary },
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {metrics.devices.offline}
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.offlineDevices')}
            </Text>
          </View>
        </View>
        
        {/* 场景统计 */}
        <Text style={[
          styles.sectionTitle,
          isDarkMode && { color: theme.dark.colors.textPrimary }
        ]}>
          {t('iot.system.scenes')}
        </Text>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              isDarkMode && { color: theme.dark.colors.textPrimary }
            ]}>
              {metrics.scenes.total}
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.totalScenes')}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              isDarkMode && { color: theme.dark.colors.textPrimary }
            ]}>
              {metrics.scenes.executions_24h}
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.executionsDay')}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              { color: theme.colors.success },
              isDarkMode && { color: theme.dark.colors.success }
            ]}>
              {metrics.scenes.successful_executions_24h}
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.successfulExecutions')}
            </Text>
          </View>
        </View>
        
        {/* 命令统计 */}
        <Text style={[
          styles.sectionTitle,
          isDarkMode && { color: theme.dark.colors.textPrimary }
        ]}>
          {t('iot.system.commands')}
        </Text>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              isDarkMode && { color: theme.dark.colors.textPrimary }
            ]}>
              {metrics.commands.total_24h}
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.totalCommands')}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              { color: theme.colors.success },
              isDarkMode && { color: theme.dark.colors.success }
            ]}>
              {metrics.commands.success_24h}
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.successfulCommands')}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              { color: metrics.commands.success_rate > 95 ? theme.colors.success : 
                       metrics.commands.success_rate > 80 ? theme.colors.warning : theme.colors.error },
              isDarkMode && { color: metrics.commands.success_rate > 95 ? theme.dark.colors.success : 
                                    metrics.commands.success_rate > 80 ? theme.dark.colors.warning : theme.dark.colors.error }
            ]}>
              {metrics.commands.success_rate.toFixed(1)}%
            </Text>
            <Text style={[
              styles.metricLabel,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}>
              {t('iot.system.successRate')}
            </Text>
          </View>
        </View>
      </Card>
    );
  };
  
  // 加载中状态
  if (isLoading) {
    return (
      <ScreenContainer
        title={t('iot.system.title')}
        backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={isDarkMode ? theme.dark.colors.primary : theme.colors.primary} 
          />
          <Text style={[
            styles.loadingText,
            isDarkMode && { color: theme.dark.colors.textSecondary }
          ]}>
            {t('common.loading')}
          </Text>
        </View>
      </ScreenContainer>
    );
  }
  
  return (
    <ScreenContainer
      title={t('iot.system.title')}
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={isDarkMode ? theme.dark.colors.primary : theme.colors.primary}
          />
        }
      >
        {renderHealthCard()}
        {renderMetricsCard()}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.textPrimary,
  },
  componentTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
    color: theme.colors.textPrimary,
  },
  componentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  componentText: {
    fontSize: 14,
    marginLeft: 8,
    color: theme.colors.textSecondary,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metricItem: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default SystemStatusScreen; 