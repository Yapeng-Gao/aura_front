import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import ListItem from '../../components/common/ListItem';
import Badge from '../../components/common/Badge';
import apiService from '../../services/api';
import theme from '../../theme';
import { IoTStackParamList } from '../../types/navigation';
import { DeviceResponse, DeviceStateResponse, DeviceCommandResponse } from '../../types/iot';

type DeviceDetailRouteProp = RouteProp<IoTStackParamList, 'DeviceDetail'>;

const DeviceDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<DeviceDetailRouteProp>();
  const navigation = useNavigation();
  const { deviceId } = route.params;
  
  const [device, setDevice] = useState<DeviceResponse | null>(null);
  const [deviceState, setDeviceState] = useState<DeviceStateResponse | null>(null);
  const [commandHistory, setCommandHistory] = useState<DeviceCommandResponse[]>([]);
  const [usageHistory, setUsageHistory] = useState<{date: string; value: number}[]>([]);
  const [isLoadingDevice, setIsLoadingDevice] = useState(true);
  const [isLoadingCommands, setIsLoadingCommands] = useState(true);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isUpdatingState, setIsUpdatingState] = useState(false);

  // 获取设备详细信息
  const fetchDeviceDetails = useCallback(async () => {
    setIsLoadingDevice(true);
    try {
      const deviceData = await apiService.iot.getDevice(deviceId);
      setDevice(deviceData);
      
      // 获取设备状态
      const stateData = await apiService.iot.getDeviceState(deviceId);
      setDeviceState(stateData);
      
      // 记录用户访问设备详情活动
      await apiService.analytics.recordActivity({
        activity_type: '设备详情',
        module: 'iot',
        action: 'view',
        resource_type: 'device',
        resource_id: deviceId
      });
    } catch (error) {
      console.error('获取设备详情失败:', error);
      Alert.alert(
        t('common.error'),
        t('iot.devices.loadError'),
        [{ text: t('common.confirm') }]
      );
    } finally {
      setIsLoadingDevice(false);
    }
  }, [deviceId, t]);

  // 获取设备命令历史
  const fetchCommandHistory = useCallback(async () => {
    setIsLoadingCommands(true);
    try {
      const commands = await apiService.iot.getDeviceCommandHistory(deviceId, { limit: 10 });
      setCommandHistory(commands);
    } catch (error) {
      console.error('获取命令历史失败:', error);
    } finally {
      setIsLoadingCommands(false);
    }
  }, [deviceId]);

  // 获取设备使用历史
  const fetchUsageHistory = useCallback(async () => {
    setIsLoadingUsage(true);
    try {
      const usage = await apiService.iot.getDeviceUsageStats(deviceId, { days: 7 });
      
      // 格式化数据用于图表
      const chartData = usage.daily_stats.map(stat => ({
        date: new Date(stat.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        value: stat.usage_minutes
      }));
      
      setUsageHistory(chartData);
    } catch (error) {
      console.error('获取使用统计失败:', error);
    } finally {
      setIsLoadingUsage(false);
    }
  }, [deviceId]);

  // 页面加载时获取数据
  useFocusEffect(
    useCallback(() => {
      fetchDeviceDetails();
      fetchCommandHistory();
      fetchUsageHistory();
    }, [fetchDeviceDetails, fetchCommandHistory, fetchUsageHistory])
  );

  // 切换设备电源状态
  const togglePower = async () => {
    if (!device || !deviceState) return;
    
    setIsUpdatingState(true);
    try {
      const newPowerState = deviceState.power === 'on' ? 'off' : 'on';
      
      await apiService.iot.updateDeviceState(deviceId, { power: newPowerState });
      
      // 更新本地设备状态
      setDeviceState(prev => prev ? { ...prev, power: newPowerState } : null);
      
      // 记录设备控制活动
      await apiService.analytics.recordActivity({
        activity_type: '设备控制',
        module: 'iot',
        action: 'update_state',
        resource_type: 'device',
        resource_id: deviceId,
        details: {
          property: 'power',
          value: newPowerState
        }
      });
      
      // 刷新命令历史
      setTimeout(() => fetchCommandHistory(), 1000);
    } catch (error) {
      console.error('更新设备状态失败:', error);
      Alert.alert(
        t('common.error'),
        t('iot.devices.controlError'),
        [{ text: t('common.confirm') }]
      );
    } finally {
      setIsUpdatingState(false);
    }
  };

  // 获取设备类型图标
  const getDeviceTypeIcon = (type: string): string => {
    switch (type) {
      case 'light': return 'bulb-outline';
      case 'thermostat': return 'thermometer-outline';
      case 'lock': return 'lock-closed-outline';
      case 'camera': return 'videocam-outline';
      case 'speaker': return 'volume-high-outline';
      case 'curtain': return 'cellular-outline';
      case 'tv': return 'tv-outline';
      case 'air_conditioner': return 'snow-outline';
      case 'fan': return 'aperture-outline';
      case 'outlet': return 'flash-outline';
      default: return 'hardware-chip-outline';
    }
  };

  // 获取设备类型名称
  const getDeviceTypeName = (type: string): string => {
    switch (type) {
      case 'light': return '灯光';
      case 'thermostat': return '温控器';
      case 'lock': return '智能锁';
      case 'camera': return '摄像头';
      case 'speaker': return '音箱';
      case 'curtain': return '窗帘';
      case 'tv': return '电视';
      case 'air_conditioner': return '空调';
      case 'fan': return '风扇';
      case 'outlet': return '插座';
      default: return '其他设备';
    }
  };

  // 格式化命令历史的时间
  const formatCommandTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  // 获取命令动作描述
  const getCommandActionText = (command: DeviceCommandResponse): string => {
    if (command.command_type === 'state_update') {
      if (command.parameters.power === 'on') {
        return '开启设备';
      } else if (command.parameters.power === 'off') {
        return '关闭设备';
      }
    }
    return `执行命令: ${command.command_type}`;
  };

  if (isLoadingDevice) {
    return (
      <ScreenContainer title="设备详情" backgroundColor={theme.colors.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>加载设备信息...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!device) {
    return (
      <ScreenContainer title="设备详情" backgroundColor={theme.colors.background}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>找不到设备</Text>
          <Text style={styles.errorMessage}>
            无法加载ID为 {deviceId} 的设备信息
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer 
      title={device.name} 
      backgroundColor={theme.colors.background}
      rightElement={
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('DeviceManagement')}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      }
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 设备概览卡片 */}
        <Card style={styles.deviceOverviewCard}>
          <View style={styles.deviceHeader}>
            <View style={styles.deviceIconContainer}>
              <Ionicons 
                name={getDeviceTypeIcon(device.device_type)}
                size={32} 
                color={theme.colors.primary} 
              />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <View style={styles.deviceMeta}>
                <Badge 
                  text={getDeviceTypeName(device.device_type)} 
                  color={theme.colors.iot.primary}
                  style={styles.typeBadge}
                />
                {deviceState && (
                  <Badge 
                    text={deviceState.power === 'on' ? '已开启' : '已关闭'} 
                    color={deviceState.power === 'on' ? theme.colors.success : theme.colors.textSecondary}
                    style={styles.statusBadge}
                  />
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.deviceActions}>
            <View style={styles.powerControl}>
              <Text style={styles.controlLabel}>电源</Text>
              <Switch
                value={deviceState?.power === 'on'}
                onValueChange={togglePower}
                disabled={isUpdatingState}
                trackColor={{ false: '#767577', true: theme.colors.success }}
                thumbColor={Platform.OS === 'android' ? theme.colors.white : ''}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
            
            {/* 显示设备所在房间 */}
            {device.room && (
              <View style={styles.locationInfo}>
                <Ionicons name="home-outline" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.locationText}>{device.room?.name || '未知房间'}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* 设备详细信息卡片 */}
        <Card style={styles.detailsCard} title="设备信息">
          <ListItem
            title="制造商"
            rightText={device.manufacturer || '未知'}
            showBottomBorder
          />
          <ListItem
            title="型号"
            rightText={device.model || '未知'}
            showBottomBorder
          />
          <ListItem
            title="固件版本"
            rightText={device.firmware_version || '未知'}
            showBottomBorder
          />
          <ListItem
            title="连接类型"
            rightText={device.protocol || '未知'}
            showBottomBorder
          />
          <ListItem
            title="IP地址"
            rightText={device.ip_address || '未知'}
            showBottomBorder
          />
          <ListItem
            title="MAC地址"
            rightText={device.mac_address || '未知'}
            showBottomBorder
          />
          <ListItem
            title="添加时间"
            rightText={new Date(device.created_at).toLocaleDateString('zh-CN')}
          />
        </Card>

        {/* 使用统计卡片 */}
        <Card style={styles.statsCard} title="使用统计">
          {isLoadingUsage ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : usageHistory.length > 0 ? (
            <>
              <Text style={styles.chartTitle}>近7天使用时长（分钟）</Text>
              <LineChart
                data={{
                  labels: usageHistory.map(item => item.date),
                  datasets: [{ data: usageHistory.map(item => item.value) }]
                }}
                width={Platform.OS === 'ios' ? 340 : 320}
                height={180}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: theme.colors.primary
                  }
                }}
                bezier
                style={styles.chart}
              />
            </>
          ) : (
            <Text style={styles.noDataText}>没有使用数据</Text>
          )}
        </Card>

        {/* 命令历史卡片 */}
        <Card style={styles.commandHistoryCard} title="命令历史">
          {isLoadingCommands ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : commandHistory.length > 0 ? (
            commandHistory.map((command, index) => (
              <ListItem
                key={command.id || index}
                title={getCommandActionText(command)}
                subtitle={formatCommandTime(command.timestamp)}
                leftIcon={command.parameters.power === 'on' ? 'power-outline' : 'power-outline'}
                leftIconColor={command.parameters.power === 'on' ? theme.colors.success : theme.colors.error}
                showBottomBorder={index < commandHistory.length - 1}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>没有命令记录</Text>
          )}
        </Card>

        {/* 底部间距 */}
        <View style={styles.bottomSpacer} />
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
    marginTop: 8,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: theme.colors.textPrimary,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  deviceOverviewCard: {
    marginBottom: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    marginRight: 8,
  },
  statusBadge: {},
  deviceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
  },
  powerControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginRight: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  detailsCard: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  commandHistoryCard: {
    marginBottom: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    paddingVertical: 16,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default DeviceDetailScreen; 