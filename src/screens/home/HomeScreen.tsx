import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import ListItem from '../../components/common/ListItem';
import theme from '../../theme';
import apiService from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, MainTabParamList } from '../../types/navigation';

// 定义导航类型
type HomeScreenProp = StackNavigationProp<RootStackParamList & MainTabParamList>;

// 快捷场景类型
interface QuickScene {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 今日日程类型
interface TodaySchedule {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder';
  location?: string;
}

// 设备状态类型
interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  state: {
    power: 'on' | 'off';
    [key: string]: any;
  };
}

// 天气信息类型
interface WeatherInfo {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickScenes, setQuickScenes] = useState<QuickScene[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [assistantName, setAssistantName] = useState('智能助手');

  // 加载数据
  useEffect(() => {
    loadHomeData();
  }, []);

  // 加载首页数据
  const loadHomeData = async (withRefresh = false) => {
    try {
      if (withRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // 获取助手设置
      try {
        const assistantSettings = await apiService.assistant.getAssistantSettings();
        console.log('assistantSettings',assistantSettings);
        if (assistantSettings) {
          setAssistantName(assistantSettings.assistant_name);
        }
      } catch (error) {
        console.error('获取助手设置失败', error);
      }

      // 获取快捷场景
      try {
        const scenes = await apiService.iot.getScenes();
        if (scenes && scenes.length > 0) {
          const formattedScenes: QuickScene[] = scenes.slice(0, 4).map((scene: any) => ({
            id: scene.id,
            name: scene.name,
            icon: getSceneIcon(scene.type),
            description: scene.description || '点击激活场景',
          }));
          setQuickScenes(formattedScenes);
        } else {
          // 使用默认场景
          setQuickScenes(defaultScenes);
        }
      } catch (error) {
        console.error('获取场景失败', error);
        setQuickScenes(defaultScenes);
      }

      // 获取今日日程
      try {
        // 临时使用默认日程，直到日历API可用
        // const today = new Date();
        // const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        // const events = await apiService.calendar.getEventsByDate(formattedDate);
        
        // 模拟假数据
        const events = [
          { id: '1', title: '产品开发周会', start_time: '2023-05-10T10:00:00Z', event_type: 'MEETING', location: '线上' },
          { id: '2', title: '完成设计文档', start_time: '2023-05-10T14:00:00Z', event_type: 'TASK' },
          { id: '3', title: '客户需求讨论', start_time: '2023-05-10T16:00:00Z', event_type: 'MEETING', location: '会议室A' },
        ];
        
        if (events && events.length > 0) {
          const formattedEvents: TodaySchedule[] = events.slice(0, 3).map((event: any) => ({
            id: event.id,
            title: event.title,
            time: new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: event.event_type === 'MEETING' ? 'meeting' : 'task',
            location: event.location,
          }));
          setTodaySchedule(formattedEvents);
        } else {
          setTodaySchedule([]);
        }
      } catch (error) {
        console.error('获取日程失败', error);
        setTodaySchedule([]);
      }

      // 获取设备状态
      try {
        const deviceList = await apiService.iot.getDevices();
        if (deviceList && deviceList.length > 0) {
          const formattedDevices: DeviceStatus[] = deviceList.slice(0, 4).map((device: any) => ({
            id: device.id,
            name: device.name,
            type: device.type,
            status: device.status,
            state: device.state || { power: 'off' },
          }));
          setDevices(formattedDevices);
        } else {
          setDevices([]);
        }
      } catch (error) {
        console.error('获取设备失败', error);
        setDevices([]);
      }

      // 获取天气信息 (模拟数据)
      setWeather({
        temperature: 23,
        condition: '晴朗',
        icon: '☀️',
        humidity: 45,
        windSpeed: 3.2,
      });

    } catch (error) {
      console.error('加载首页数据失败', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    loadHomeData(true);
  };

  // 执行场景
  const executeScene = async (sceneId: string) => {
    try {
      await apiService.iot.executeScene(sceneId);
      // 刷新设备状态
      loadHomeData(true);
    } catch (error) {
      console.error('执行场景失败', error);
    }
  };

  // 根据场景类型获取图标
  const getSceneIcon = (type: string): string => {
    switch (type) {
      case 'morning':
        return '🌅';
      case 'night':
        return '🌙';
      case 'movie':
        return '🎬';
      case 'home':
        return '🏠';
      case 'away':
        return '🚶';
      case 'party':
        return '🎉';
      case 'work':
        return '💼';
      case 'relax':
        return '🛋️';
      default:
        return '📱';
    }
  };

  // 获取日程类型图标
  const getScheduleIcon = (type: 'meeting' | 'task' | 'reminder') => {
    switch (type) {
      case 'meeting':
        return <Ionicons name="people" size={22} color={theme.colors.primary} />;
      case 'task':
        return <Ionicons name="checkbox-outline" size={22} color={theme.colors.secondary} />;
      case 'reminder':
        return <Ionicons name="alarm-outline" size={22} color={theme.colors.warning} />;
      default:
        return <Ionicons name="calendar-outline" size={22} color={theme.colors.textPrimary} />;
    }
  };

  // 获取设备类型图标
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'light':
        return <Ionicons name="bulb-outline" size={22} color={theme.colors.warning} />;
      case 'thermostat':
        return <Ionicons name="thermometer-outline" size={22} color={theme.colors.primary} />;
      case 'camera':
        return <Ionicons name="videocam-outline" size={22} color={theme.colors.error} />;
      case 'lock':
        return <Ionicons name="lock-closed-outline" size={22} color={theme.colors.success} />;
      case 'speaker':
        return <Ionicons name="volume-high-outline" size={22} color={theme.colors.info} />;
      case 'tv':
        return <Ionicons name="tv-outline" size={22} color={theme.colors.textPrimary} />;
      default:
        return <Ionicons name="hardware-chip-outline" size={22} color={theme.colors.textSecondary} />;
    }
  };

  // 默认场景数据
  const defaultScenes: QuickScene[] = [
    {
      id: '1',
      name: '回家模式',
      icon: '🏠',
      description: '开启空调、灯光和窗帘',
    },
    {
      id: '2',
      name: '睡眠模式',
      icon: '🌙',
      description: '关闭灯光、开启空调',
    },
    {
      id: '3',
      name: '影院模式',
      icon: '🎬',
      description: '关闭主灯、开启电视',
    },
    {
      id: '4',
      name: '离家模式',
      icon: '🚶',
      description: '关闭所有设备',
    },
  ];

  if (isLoading) {
    return (
      <ScreenContainer
        title="首页"
        backgroundColor={theme.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="首页"
      backgroundColor={theme.colors.background}
    >
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 天气和日期卡片 */}
        {weather && (
          <Card style={styles.weatherCard}>
            <View style={styles.weatherContent}>
              <View style={styles.weatherMain}>
                <Text style={styles.weatherIcon}>{weather.icon}</Text>
                <View>
                  <Text style={styles.temperature}>{weather.temperature}°C</Text>
                  <Text style={styles.weatherCondition}>{weather.condition}</Text>
                </View>
              </View>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="water-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="flag-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.weatherDetailText}>{weather.windSpeed}m/s</Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* 快捷场景 */}
        <Card title="快捷场景" style={styles.card}>
          <View style={styles.scenesContainer}>
            {quickScenes.map((scene) => (
              <TouchableOpacity
                key={scene.id}
                style={styles.sceneItem}
                onPress={() => executeScene(scene.id)}
              >
                <View style={styles.sceneIcon}>
                  <Text style={styles.sceneIconText}>{scene.icon}</Text>
                </View>
                <Text style={styles.sceneName}>{scene.name}</Text>
                <Text style={styles.sceneDescription}>{scene.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* 设备状态 */}
        <Card 
          title="设备状态" 
          style={styles.card}
          rightContent={
            <TouchableOpacity onPress={() => navigation.navigate('DeviceManagement')}>
              <Text style={styles.viewAllText}>查看全部</Text>
            </TouchableOpacity>
          }
        >
          {devices.length > 0 ? (
            <View>
              {devices.map((device) => (
                <ListItem
                  key={device.id}
                  title={device.name}
                  subtitle={device.state.power === 'on' ? '已开启' : '已关闭'}
                  leftIcon={getDeviceIcon(device.type)}
                  rightIcon={
                    <View style={[styles.statusIndicator, { backgroundColor: device.state.power === 'on' ? theme.colors.success : theme.colors.divider }]} />
                  }
                  onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.id })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="cube-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>未发现设备</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('DeviceManagement')}
              >
                <Text style={styles.emptyStateButtonText}>添加设备</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* 今日日程 */}
        <Card 
          title="今日日程" 
          style={styles.card}
          rightContent={
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.viewAllText}>查看全部</Text>
            </TouchableOpacity>
          }
        >
          {todaySchedule.length > 0 ? (
            todaySchedule.map((schedule) => (
              <ListItem
                key={schedule.id}
                title={schedule.title}
                subtitle={`${schedule.time}${schedule.location ? ` · ${schedule.location}` : ''}`}
                leftIcon={getScheduleIcon(schedule.type)}
                onPress={() => navigation.navigate('EventDetail', { eventId: schedule.id })}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>今天没有日程安排</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('ScheduleEvent')}
              >
                <Text style={styles.emptyStateButtonText}>添加日程</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* AI助手快捷入口 */}
        <Card title="AI助手" style={styles.card}>
          <TouchableOpacity
            style={styles.assistantButton}
            onPress={() => navigation.navigate('AIAssistant')}
          >
            <View style={styles.assistantContent}>
              <View style={styles.assistantIconContainer}>
                <Text style={styles.assistantIcon}>🤖</Text>
              </View>
              <View style={styles.assistantTextContainer}>
                <Text style={styles.assistantTitle}>{assistantName}</Text>
                <Text style={styles.assistantDescription}>有什么我可以帮您的吗？</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* 功能快捷方式 */}
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate('UserAnalytics')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="bar-chart-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickAccessText}>数据分析</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => {
              // @ts-ignore - 忽略类型检查，实际上是可以工作的
              navigation.navigate('Productivity');
            }}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: `${theme.colors.secondary}15` }]}>
              <Ionicons name="list-outline" size={24} color={theme.colors.secondary} />
            </View>
            <Text style={styles.quickAccessText}>任务清单</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => {
              // @ts-ignore - 忽略类型检查，实际上是可以工作的
              navigation.navigate('IoT');
            }}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: `${theme.colors.success}15` }]}>
              <Ionicons name="home-outline" size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.quickAccessText}>智能家居</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => {
              // @ts-ignore - 忽略类型检查，实际上是可以工作的
              navigation.navigate('Profile');
            }}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: `${theme.colors.info}15` }]}>
              <Ionicons name="settings-outline" size={24} color={theme.colors.info} />
            </View>
            <Text style={styles.quickAccessText}>设置</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  weatherCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
  },
  weatherContent: {
    padding: theme.spacing.sm,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: theme.spacing.md,
  },
  temperature: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  weatherCondition: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  weatherDetails: {
    flexDirection: 'row',
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  weatherDetailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  viewAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  scenesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: theme.spacing.xs,
  },
  sceneItem: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  sceneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  sceneIconText: {
    fontSize: 24,
  },
  sceneName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sceneDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  scheduleIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  emptyStateButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
  },
  assistantButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  assistantContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assistantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantIcon: {
    fontSize: 24,
  },
  assistantTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  assistantTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  assistantDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  quickAccessItem: {
    alignItems: 'center',
    width: '22%',
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  quickAccessText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});

export default HomeScreen; 