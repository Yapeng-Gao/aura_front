import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import useDarkMode from '../../hooks/useDarkMode';
import theme from '../../theme';
import ScreenContainer from '../../components/common/ScreenContainer';
import RoomCard from '../../components/iot/RoomCard';
import DeviceCard from '../../components/iot/DeviceCard';
import SceneButton from '../../components/iot/SceneButton';
import EmptyState from '../../components/common/EmptyState';
import apiService from '../../services/api';
import { IoTNavigationProp } from '../../types/navigation';

// 导航类型定义
type SmartHomeNavigationProp = IoTNavigationProp<'SmartHome'>;

const SmartHomeScreen: React.FC = () => {
  // 使用导航
  const navigation = useNavigation<SmartHomeNavigationProp>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDarkMode = useDarkMode();

  // 状态定义
  const [rooms, setRooms] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [isLoadingScenes, setIsLoadingScenes] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [executingSceneId, setExecutingSceneId] = useState<string | null>(null);

  // 获取房间数据
  const loadRooms = useCallback(async () => {
    try {
      const roomsData = await apiService.iot.getRooms();
      if (roomsData) {
        setRooms(roomsData);
        
        // 如果有房间，默认选择第一个
        if (roomsData.length > 0 && !selectedRoom) {
          setSelectedRoom(roomsData[0].room_id);
        }
      }
      
      setIsLoadingRooms(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error('获取房间失败:', error);
      setIsLoadingRooms(false);
      setIsRefreshing(false);
      Alert.alert(
        t('common.error'),
        t('iot.rooms.loadError'),
        [{ text: t('common.confirm') }]
      );
    }
  }, [selectedRoom, t]);

  // 获取设备数据
  const loadDevices = useCallback(async () => {
    try {
      const devicesData = await apiService.iot.getDevices();
      if (devicesData) {
        setDevices(devicesData);
      }
      setIsLoadingDevices(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error('获取设备失败:', error);
      setIsLoadingDevices(false);
      setIsRefreshing(false);
      Alert.alert(
        t('common.error'),
        t('iot.devices.loadError'),
        [{ text: t('common.confirm') }]
      );
    }
  }, [t]);

  // 获取场景数据
  const loadScenes = useCallback(async () => {
    try {
      const scenesData = await apiService.iot.getScenes();
      if (scenesData) {
        setScenes(scenesData);
      }
      setIsLoadingScenes(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error('获取场景失败:', error);
      setIsLoadingScenes(false);
      setIsRefreshing(false);
      Alert.alert(
        t('common.error'),
        t('iot.scenes.loadError'),
        [{ text: t('common.confirm') }]
      );
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
        resource_id: 'smart_home',
        details: {
          screen: 'SmartHomeScreen'
        }
      });
    } catch (error) {
      console.error('记录活动失败:', error);
    }
  }, []);

  // 首次加载和页面聚焦时获取数据
  useFocusEffect(
    useCallback(() => {
      loadRooms();
      loadDevices();
      loadScenes();
      recordPageVisit();
    }, [loadRooms, loadDevices, loadScenes, recordPageVisit])
  );

  // 下拉刷新
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRooms();
    loadDevices();
    loadScenes();
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
      setExecutingSceneId(sceneId);
      await apiService.iot.executeScene(sceneId);
      
      // 记录场景执行活动
      await apiService.analytics.recordActivity({
        activity_type: '场景执行',
        module: 'iot',
        action: 'execute',
        resource_type: 'scene',
        resource_id: sceneId
      });
      
      // 执行成功，更新设备状态
      loadDevices();
      
      // 3秒后重置执行状态
      setTimeout(() => {
        setExecutingSceneId(null);
      }, 3000);
    } catch (error) {
      console.error('执行场景失败:', error);
      setExecutingSceneId(null);
      Alert.alert(
        t('common.error'),
        t('iot.scenes.executeError'),
        [{ text: t('common.confirm') }]
      );
    }
  };

  // 获取当前房间的设备
  const getCurrentRoomDevices = () => {
    if (!selectedRoom) return [];
    return devices.filter(device => device.room === selectedRoom);
  };

  // 处理选择房间
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  // 渲染房间列表
  const renderRooms = () => {
    if (isLoadingRooms) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={isDarkMode ? theme.dark.colors.primary : theme.colors.primary} 
          />
        </View>
      );
    }

    if (rooms.length === 0) {
      return (
        <EmptyState
          icon="home-outline"
          title={t('iot.rooms.empty.title')}
          message={t('iot.rooms.empty.message')}
          actionLabel={t('iot.rooms.add')}
          onAction={() => navigation.navigate('AddRoom')}
          isDarkMode={isDarkMode}
        />
      );
    }

    return (
      <View style={styles.roomsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionTitle,
            isDarkMode && { color: theme.dark.colors.textPrimary }
          ]}>
            {t('iot.rooms.title')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoomManagement')}>
            <Text style={[
              styles.seeAllText,
              { color: isDarkMode ? theme.dark.colors.primary : theme.colors.primary }
            ]}>
              {t('common.seeAll')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.room_id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: 160, marginRight: 12 }}>
              <RoomCard
                room={{
                  room_id: item.room_id,
                  name: item.name,
                  icon: item.icon,
                  image: item.image,
                  devices_count: item.devices_count || 0,
                  active_devices_count: item.active_devices_count || 0
                }}
                devices={devices.filter(device => device.room === item.room_id)}
                onPress={() => handleRoomSelect(item.room_id)}
                isDarkMode={isDarkMode}
              />
            </View>
          )}
          style={styles.roomList}
        />
      </View>
    );
  };

  // 渲染场景列表
  const renderScenes = () => {
    if (isLoadingScenes) {
      return null; // 不显示加载指示器，因为房间列表已经有了
    }

    if (scenes.length === 0) {
      return (
        <View style={styles.emptySceneContainer}>
          <Text style={[
            styles.emptySceneText,
            isDarkMode && { color: theme.dark.colors.textSecondary }
          ]}>
            {t('iot.scenes.empty')}
          </Text>
          <TouchableOpacity 
            style={[
              styles.addSceneButton,
              { backgroundColor: isDarkMode ? theme.dark.colors.primary : theme.colors.primary }
            ]}
            onPress={() => navigation.navigate('AddScene')}
          >
            <Icon name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addSceneButtonText}>
              {t('iot.scenes.add')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.scenesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionTitle,
            isDarkMode && { color: theme.dark.colors.textPrimary }
          ]}>
            {t('iot.scenes.title')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SceneManagement')}>
            <Text style={[
              styles.seeAllText,
              { color: isDarkMode ? theme.dark.colors.primary : theme.colors.primary }
            ]}>
              {t('common.seeAll')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sceneList}
        >
          {scenes.map(scene => (
            <SceneButton
              key={scene.scene_id}
              scene={scene}
              onPress={executeScene}
              isExecuting={executingSceneId === scene.scene_id}
              isDarkMode={isDarkMode}
            />
          ))}
          <TouchableOpacity 
            style={[
              styles.addSceneButton,
              { backgroundColor: isDarkMode ? theme.dark.colors.cardBackground : theme.colors.cardBackground }
            ]}
            onPress={() => navigation.navigate('AddScene')}
          >
            <Icon 
              name="add" 
              size={16} 
              color={isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary} 
            />
            <Text style={[
              styles.addButtonText,
              { color: isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary }
            ]}>
              {t('iot.scenes.add')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // 渲染房间设备
  const renderRoomDevices = () => {
    if (isLoadingDevices) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={isDarkMode ? theme.dark.colors.primary : theme.colors.primary} 
          />
        </View>
      );
    }

    const roomDevices = getCurrentRoomDevices();
    
    if (roomDevices.length === 0) {
      return (
        <EmptyState
          icon="bulb-outline"
          title={t('iot.devices.empty.title')}
          message={t('iot.devices.empty.message')}
          actionLabel={t('iot.devices.add')}
          onAction={() => navigation.navigate('AddDevice', { roomId: selectedRoom || undefined })}
          isDarkMode={isDarkMode}
        />
      );
    }

    const selectedRoomData = rooms.find(room => room.room_id === selectedRoom);

    return (
      <View style={styles.devicesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionTitle,
            isDarkMode && { color: theme.dark.colors.textPrimary }
          ]}>
            {selectedRoomData ? selectedRoomData.name : t('iot.devices.title')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddDevice', { roomId: selectedRoom || undefined })}>
            <Text style={[
              styles.addDeviceText,
              { color: isDarkMode ? theme.dark.colors.primary : theme.colors.primary }
            ]}>
              {t('iot.devices.add')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {roomDevices.map(device => (
          <DeviceCard
            key={device.device_id}
            device={device}
            onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.device_id })}
            onPowerToggle={() => toggleDevicePower(device.device_id, device.state?.power || 'off')}
            isDarkMode={isDarkMode}
          />
        ))}
      </View>
    );
  };

  // 添加设备按钮
  const renderAddDeviceButton = () => {
    return (
      <TouchableOpacity 
        style={[
          styles.addDeviceButton,
          { backgroundColor: isDarkMode ? theme.dark.colors.primary : theme.colors.primary }
        ]}
        onPress={() => navigation.navigate('AddDevice')}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    );
  };

  // 设置页面右侧按钮
  const headerRight = () => (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('SystemStatus')}>
        <Icon 
          name="pulse-outline" 
          size={24} 
          color={isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary} 
          style={styles.headerIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
        <Icon 
          name="notifications-outline" 
          size={24} 
          color={isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary} 
          style={styles.headerIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('DeviceSearch')}>
        <Icon 
          name="search-outline" 
          size={24} 
          color={isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary} 
          style={styles.headerIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer
      title={t('iot.title')}
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      headerRight={headerRight()}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={isDarkMode ? theme.dark.colors.primary : theme.colors.primary}
          />
        }
      >
        {renderRooms()}
        {renderScenes()}
        {renderRoomDevices()}
      </ScrollView>
      
      {renderAddDeviceButton()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  roomsContainer: {
    marginBottom: 20,
  },
  scenesContainer: {
    marginBottom: 20,
  },
  devicesContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  addDeviceText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  roomList: {
    flexGrow: 0,
  },
  sceneList: {
    flexGrow: 0,
    marginBottom: 8,
  },
  addSceneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: theme.colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  addSceneButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  emptySceneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  emptySceneText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  addDeviceButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
  },
});

export default SmartHomeScreen;