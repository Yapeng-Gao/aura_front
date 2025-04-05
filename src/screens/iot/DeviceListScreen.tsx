import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  useColorScheme
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../types/navigation';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import DeviceCard from '../../components/iot/DeviceCard';
import theme from '../../theme';
import useTranslation from '../../hooks/useTranslation';
import apiService from '../../services/api';

type DeviceListScreenProps = StackScreenProps<RootStackParamList, 'DeviceList'>;

const DeviceListScreen: React.FC<DeviceListScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const [devices, setDevices] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline'>('all');

  // 加载设备列表
  const loadDevices = useCallback(async () => {
    try {
      const devicesData = await apiService.iot.getDevices();
      
      if (devicesData) {
        // 对于每个设备，获取其状态
        const devicesWithState = await Promise.all(
          devicesData.map(async (device: any) => {
            try {
              const state = await apiService.iot.getDeviceState(device.device_id);
              return { ...device, state: state || { isOnline: false, power: 'off' } };
            } catch (error) {
              console.error(`获取设备${device.name}状态失败:`, error);
              return { ...device, state: { isOnline: false, power: 'off' } };
            }
          })
        );
        
        setDevices(devicesWithState);
      }
      
      // 加载场景列表
      const scenesData = await apiService.iot.getScenes();
      if (scenesData) {
        setScenes(scenesData);
      }
    } catch (error) {
      console.error('加载设备列表失败:', error);
      Alert.alert(
        t('common.error'),
        t('iot.devices.loadError'),
        [{ text: t('common.confirm') }]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  // 记录用户访问页面活动
  const recordPageVisit = useCallback(async () => {
    try {
      await apiService.analytics.recordActivity({
        activity_type: '页面访问',
        module: 'iot',
        action: 'view',
        resource_type: 'screen',
        resource_id: 'device_list',
        details: {
          screen: 'DeviceListScreen'
        }
      });
    } catch (error) {
      console.error('记录活动失败:', error);
    }
  }, []);

  // 首次加载和页面聚焦时获取设备列表
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadDevices();
      recordPageVisit();
    }, [loadDevices, recordPageVisit])
  );

  // 下拉刷新
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDevices();
  };

  // 切换设备的电源状态
  const toggleDevicePower = async (deviceId: string, currentPower: string) => {
    try {
      const newPower = currentPower === 'on' ? 'off' : 'on';
      
      await apiService.iot.updateDeviceState(deviceId, { power: newPower });
      
      // 记录设备控制活动
      await apiService.analytics.recordActivity({
        activity_type: '设备控制',
        module: 'iot',
        action: 'update_state',
        resource_type: 'device',
        resource_id: deviceId,
        details: {
          property: 'power',
          value: newPower
        }
      });
      
      // 更新本地设备列表状态
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.device_id === deviceId 
            ? { ...device, state: { ...device.state, power: newPower } } 
            : device
        )
      );
    } catch (error) {
      console.error('更新设备状态失败:', error);
      Alert.alert(
        t('common.error'),
        t('iot.devices.controlError'),
        [{ text: t('common.confirm') }]
      );
    }
  };

  // 执行场景
  const executeScene = async (sceneId: string) => {
    try {
      await apiService.iot.executeScene(sceneId);
      
      // 记录场景执行活动
      await apiService.analytics.recordActivity({
        activity_type: '场景执行',
        module: 'iot',
        action: 'execute',
        resource_type: 'scene',
        resource_id: sceneId
      });
      
      Alert.alert(
        t('common.success'),
        t('iot.scenes.executeSuccess'),
        [{ text: t('common.confirm') }]
      );
      
      // 执行场景后重新加载设备状态
      setTimeout(() => loadDevices(), 1000);
    } catch (error) {
      console.error('执行场景失败:', error);
      Alert.alert(
        t('common.error'),
        t('iot.scenes.executeError'),
        [{ text: t('common.confirm') }]
      );
    }
  };

  // 过滤设备显示
  const filteredDevices = devices.filter(device => {
    if (filterMode === 'all') return true;
    if (filterMode === 'online') return device.state?.isOnline;
    if (filterMode === 'offline') return !device.state?.isOnline;
    return true;
  });

  // 导航到设备详情页
  const goToDeviceDetail = (deviceId: string) => {
    navigation.navigate('DeviceDetail', { deviceId });
  };

  // 导航到添加设备页面
  const goToAddDevice = () => {
    navigation.navigate('AddDevice');
  };

  // 渲染过滤选项
  const renderFilterOptions = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterMode === 'all' && styles.activeFilterButton,
          isDarkMode && filterMode === 'all' && styles.activeFilterButtonDark
        ]}
        onPress={() => setFilterMode('all')}
      >
        <Text style={[
          styles.filterButtonText,
          filterMode === 'all' && styles.activeFilterText,
          isDarkMode && styles.textDark,
          isDarkMode && filterMode === 'all' && styles.activeFilterTextDark
        ]}>
          {t('iot.devices.filterAll')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterMode === 'online' && styles.activeFilterButton,
          isDarkMode && filterMode === 'online' && styles.activeFilterButtonDark
        ]}
        onPress={() => setFilterMode('online')}
      >
        <Text style={[
          styles.filterButtonText,
          filterMode === 'online' && styles.activeFilterText,
          isDarkMode && styles.textDark,
          isDarkMode && filterMode === 'online' && styles.activeFilterTextDark
        ]}>
          {t('iot.devices.filterOnline')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterMode === 'offline' && styles.activeFilterButton,
          isDarkMode && filterMode === 'offline' && styles.activeFilterButtonDark
        ]}
        onPress={() => setFilterMode('offline')}
      >
        <Text style={[
          styles.filterButtonText,
          filterMode === 'offline' && styles.activeFilterText,
          isDarkMode && styles.textDark,
          isDarkMode && filterMode === 'offline' && styles.activeFilterTextDark
        ]}>
          {t('iot.devices.filterOffline')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染场景列表
  const renderSceneList = () => {
    if (scenes.length === 0) return null;
    
    return (
      <View style={styles.scenesContainer}>
        <Text style={[
          styles.sectionTitle,
          isDarkMode && styles.textDark
        ]}>
          {t('iot.scenes.title')}
        </Text>
        
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={scenes}
          keyExtractor={(item) => item.scene_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.sceneButton,
                isDarkMode && styles.sceneButtonDark
              ]}
              onPress={() => executeScene(item.scene_id)}
            >
              <Icon 
                name={item.icon || "flash-outline"} 
                size={24} 
                color={isDarkMode ? theme.dark.colors.primary : theme.colors.primary} 
              />
              <Text style={[
                styles.sceneName,
                isDarkMode && styles.textDark
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.sceneList}
        />
      </View>
    );
  };

  // 渲染设备列表
  const renderDeviceList = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (devices.length === 0) {
      return (
        <EmptyState
          icon="bulb-outline"
          title={t('iot.devices.empty.title')}
          message={t('iot.devices.empty.message')}
          actionLabel={t('iot.devices.add')}
          onAction={goToAddDevice}
          isDarkMode={isDarkMode}
        />
      );
    }

    return (
      <>
        {renderFilterOptions()}
        
        <FlatList
          data={filteredDevices}
          keyExtractor={(item) => item.device_id}
          renderItem={({ item }) => (
            <DeviceCard
              device={item}
              onPress={() => goToDeviceDetail(item.device_id)}
              onPowerToggle={() => toggleDevicePower(item.device_id, item.state?.power)}
              isDarkMode={isDarkMode}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={isDarkMode ? theme.dark.colors.primary : theme.colors.primary}
            />
          }
          contentContainerStyle={styles.deviceList}
          ListEmptyComponent={
            filterMode !== 'all' ? (
              <View style={styles.emptyFilterContainer}>
                <Text style={[
                  styles.emptyFilterText,
                  isDarkMode && styles.textDark
                ]}>
                  {filterMode === 'online' 
                    ? t('iot.devices.noOnlineDevices')
                    : t('iot.devices.noOfflineDevices')}
                </Text>
              </View>
            ) : null
          }
        />
      </>
    );
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: theme.dark.colors.background }
    ]}>
      <Header 
        title={t('iot.devices.title')}
        rightIcon={
          <TouchableOpacity onPress={goToAddDevice}>
            <Icon 
              name="add-circle-outline" 
              size={24} 
              color={isDarkMode ? theme.dark.colors.primary : theme.colors.primary} 
            />
          </TouchableOpacity>
        }
      />
      
      {renderSceneList()}
      {renderDeviceList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceList: {
    padding: theme.spacing.md,
  },
  scenesContainer: {
    padding: theme.spacing.md,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  sceneList: {
    paddingBottom: theme.spacing.md,
  },
  sceneButton: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sceneButtonDark: {
    backgroundColor: theme.dark.colors.cardBackground,
  },
  sceneName: {
    marginTop: theme.spacing.sm,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingTop: 0,
    paddingBottom: theme.spacing.sm,
  },
  filterButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  activeFilterButtonDark: {
    backgroundColor: theme.dark.colors.primary,
    borderColor: theme.dark.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  activeFilterTextDark: {
    color: 'white',
  },
  emptyFilterContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  textDark: {
    color: theme.dark.colors.textPrimary,
  },
});

export default DeviceListScreen; 