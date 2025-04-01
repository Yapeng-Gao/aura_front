import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Platform } from 'react-native'; // 确保导入 Platform
import theme from '../../theme'; // 确保导入 theme

// 房间类型定义
interface Room {
  id: string;
  name: string;
  devices: Device[];
}

// 设备类型定义
interface Device {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'speaker' | 'curtain' | 'tv' | 'other';
  status: 'on' | 'off' | 'locked' | 'unlocked' | string;
  value?: number;
  isConnected: boolean;
}

// 场景类型定义
interface Scene {
  id: string;
  name: string;
  icon: string;
  devices: {
    deviceId: string;
    action: string;
    value?: number;
  }[];
  isActive: boolean;
}

const SmartHomeScreen: React.FC = () => {
  // 房间状态
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      name: '客厅',
      devices: [
        { id: '101', name: '主灯', type: 'light', status: 'on', isConnected: true },
        { id: '102', name: '电视', type: 'tv', status: 'off', isConnected: true },
        { id: '103', name: '空调', type: 'thermostat', status: 'on', value: 24, isConnected: true },
        { id: '104', name: '窗帘', type: 'curtain', status: 'closed', isConnected: true },
        { id: '105', name: '智能音箱', type: 'speaker', status: 'off', isConnected: true },
      ],
    },
    {
      id: '2',
      name: '卧室',
      devices: [
        { id: '201', name: '床头灯', type: 'light', status: 'off', isConnected: true },
        { id: '202', name: '空调', type: 'thermostat', status: 'off', value: 22, isConnected: true },
        { id: '203', name: '窗帘', type: 'curtain', status: 'open', isConnected: true },
      ],
    },
    {
      id: '3',
      name: '厨房',
      devices: [
        { id: '301', name: '吊灯', type: 'light', status: 'off', isConnected: true },
        { id: '302', name: '冰箱', type: 'other', status: 'on', isConnected: true },
      ],
    },
    {
      id: '4',
      name: '门厅',
      devices: [
        { id: '401', name: '门锁', type: 'lock', status: 'locked', isConnected: true },
        { id: '402', name: '监控摄像头', type: 'camera', status: 'on', isConnected: true },
      ],
    },
  ]);
  
  // 场景状态
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: '1',
      name: '回家模式',
      icon: '🏠',
      devices: [
        { deviceId: '101', action: 'on' },
        { deviceId: '103', action: 'on', value: 24 },
        { deviceId: '104', action: 'open' },
      ],
      isActive: false,
    },
    {
      id: '2',
      name: '离家模式',
      icon: '🚶',
      devices: [
        { deviceId: '101', action: 'off' },
        { deviceId: '102', action: 'off' },
        { deviceId: '103', action: 'off' },
        { deviceId: '104', action: 'closed' },
        { deviceId: '105', action: 'off' },
        { deviceId: '401', action: 'locked' },
        { deviceId: '402', action: 'on' },
      ],
      isActive: false,
    },
    {
      id: '3',
      name: '睡眠模式',
      icon: '🌙',
      devices: [
        { deviceId: '101', action: 'off' },
        { deviceId: '102', action: 'off' },
        { deviceId: '103', action: 'on', value: 22 },
        { deviceId: '104', action: 'closed' },
        { deviceId: '201', action: 'off' },
        { deviceId: '202', action: 'on', value: 22 },
        { deviceId: '203', action: 'closed' },
        { deviceId: '401', action: 'locked' },
      ],
      isActive: false,
    },
    {
      id: '4',
      name: '影院模式',
      icon: '🎬',
      devices: [
        { deviceId: '101', action: 'off' },
        { deviceId: '102', action: 'on' },
        { deviceId: '104', action: 'closed' },
        { deviceId: '105', action: 'on' },
      ],
      isActive: false,
    },
  ]);
  
  // 当前选中的房间
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(rooms[0]);
  
  // 切换设备状态
  const toggleDeviceStatus = (deviceId: string) => {
    setRooms(rooms.map(room => {
      const updatedDevices = room.devices.map(device => {
        if (device.id === deviceId) {
          let newStatus: string;
          
          switch (device.type) {
            case 'light':
            case 'tv':
            case 'speaker':
              newStatus = device.status === 'on' ? 'off' : 'on';
              break;
            case 'lock':
              newStatus = device.status === 'locked' ? 'unlocked' : 'locked';
              break;
            case 'curtain':
              newStatus = device.status === 'open' ? 'closed' : 'open';
              break;
            default:
              newStatus = device.status;
          }
          
          return { ...device, status: newStatus };
        }
        return device;
      });
      
      return { ...room, devices: updatedDevices };
    }));
  };
  
  // 调整设备值
  const adjustDeviceValue = (deviceId: string, newValue: number) => {
    setRooms(rooms.map(room => {
      const updatedDevices = room.devices.map(device => {
        if (device.id === deviceId) {
          return { ...device, value: newValue };
        }
        return device;
      });
      
      return { ...room, devices: updatedDevices };
    }));
  };
  
  // 激活场景
  const activateScene = (sceneId: string) => {
    // 更新场景状态
    setScenes(scenes.map(scene => ({
      ...scene,
      isActive: scene.id === sceneId,
    })));
    
    // 获取要激活的场景
    const targetScene = scenes.find(scene => scene.id === sceneId);
    
    if (targetScene) {
      // 应用场景设置到设备
      setRooms(rooms.map(room => {
        const updatedDevices = room.devices.map(device => {
          const deviceAction = targetScene.devices.find(d => d.deviceId === device.id);
          
          if (deviceAction) {
            return {
              ...device,
              status: deviceAction.action,
              ...(deviceAction.value !== undefined && { value: deviceAction.value }),
            };
          }
          
          return device;
        });
        
        return { ...room, devices: updatedDevices };
      }));
    }
  };
  
  // 获取设备图标
  const getDeviceIcon = (type: string, status: string) => {
    switch (type) {
      case 'light':
        return status === 'on' ? '💡' : '🔦';
      case 'thermostat':
        return status === 'on' ? '🌡️' : '❄️';
      case 'lock':
        return status === 'locked' ? '🔒' : '🔓';
      case 'camera':
        return status === 'on' ? '📹' : '📷';
      case 'speaker':
        return status === 'on' ? '🔊' : '🔈';
      case 'curtain':
        return status === 'open' ? '🪟' : '🎦';
      case 'tv':
        return status === 'on' ? '📺' : '📴';
      default:
        return '📱';
    }
  };
  
  // 获取设备状态文本
  const getDeviceStatusText = (device: Device) => {
    switch (device.type) {
      case 'light':
      case 'tv':
      case 'speaker':
      case 'camera':
        return device.status === 'on' ? '开启' : '关闭';
      case 'lock':
        return device.status === 'locked' ? '已锁定' : '已解锁';
      case 'curtain':
        return device.status === 'open' ? '已打开' : '已关闭';
      case 'thermostat':
        return device.status === 'on' ? `${device.value}°C` : '关闭';
      default:
        return device.status;
    }
  };
  
  // 渲染房间选择器
  const renderRoomSelector = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.roomSelectorContainer}
        contentContainerStyle={styles.roomSelectorContent}
      >
        {rooms.map(room => (
          <TouchableOpacity
            key={room.id}
            style={[
              styles.roomItem,
              selectedRoom?.id === room.id && styles.selectedRoomItem
            ]}
            onPress={() => setSelectedRoom(room)}
          >
            <Text style={[
              styles.roomName,
              selectedRoom?.id === room.id && styles.selectedRoomName
            ]}>
              {room.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // 渲染场景控制
  const renderScenes = () => {
    return (
      <Card title="场景" style={styles.scenesCard}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scenesContainer}
        >
          {scenes.map(scene => (
            <TouchableOpacity
              key={scene.id}
              style={[
                styles.sceneItem,
                scene.isActive && styles.activeSceneItem
              ]}
              onPress={() => activateScene(scene.id)}
            >
              <Text style={styles.sceneIcon}>{scene.icon}</Text>
              <Text style={[
                styles.sceneName,
                scene.isActive && styles.activeSceneName
              ]}>
                {scene.name}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.addSceneItem}>
            <Text style={styles.addSceneIcon}>+</Text>
            <Text style={styles.addSceneName}>添加场景</Text>
          </TouchableOpacity>
        </ScrollView>
      </Card>
    );
  };
  
  // 渲染设备控制
  const renderDevices = () => {
    if (!selectedRoom) return null;
    
    return (
      <Card title={`${selectedRoom.name}设备`} style={styles.devicesCard}>
        <View style={styles.devicesGrid}>
          {selectedRoom.devices.map(device => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceItem,
                !device.isConnected && styles.disconnectedDevice
              ]}
              onPress={() => toggleDeviceStatus(device.id)}
              disabled={!device.isConnected}
            >
              <Text style={styles.deviceIcon}>
                {getDeviceIcon(device.type, device.status)}
              </Text>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={[
                styles.deviceStatus,
                device.status === 'on' && styles.deviceStatusOn,
                device.status === 'off' && styles.deviceStatusOff,
                device.status === 'locked' && styles.deviceStatusLocked,
                device.status === 'unlocked' && styles.deviceStatusUnlocked,
              ]}>
                {getDeviceStatusText(device)}
              </Text>
              
              {device.type === 'thermostat' && device.status === 'on' && (
                <View style={styles.thermostatControls}>
                  <TouchableOpacity
                    style={styles.thermostatButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (device.value && device.value > 16) {
                        adjustDeviceValue(device.id, device.value - 1);
                      }
                    }}
                  >
                    <Text style={styles.thermostatButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.thermostatValue}>{device.value}°C</Text>
                  
                  <TouchableOpacity
                    style={styles.thermostatButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (device.value && device.value < 30) {
                        adjustDeviceValue(device.id, device.value + 1);
                      }
                    }}
                  >
                    <Text style={styles.thermostatButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.addDeviceItem}>
            <Text style={styles.addDeviceIcon}>+</Text>
            <Text style={styles.addDeviceName}>添加设备</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };
  
  // 渲染快速控制
  const renderQuickControls = () => {
    // 获取所有灯光设备
    const allLights = rooms.flatMap(room => 
      room.devices.filter(device => device.type === 'light')
    );
    
    // 检查是否所有灯都开启
    const allLightsOn = allLights.every(light => light.status === 'on');
    
    // 获取所有门锁
    const allLocks = rooms.flatMap(room => 
      room.devices.filter(device => device.type === 'lock')
    );
    
    // 检查是否所有门锁都锁定
    const allLocksLocked = allLocks.every(lock => lock.status === 'locked');
    
    return (
      <Card title="快速控制" style={styles.quickControlsCard}>
        <View style={styles.quickControlsContainer}>
          <TouchableOpacity
            style={styles.quickControlItem}
            onPress={() => {
              // 切换所有灯光
              setRooms(rooms.map(room => ({
                ...room,
                devices: room.devices.map(device => 
                  device.type === 'light' 
                    ? { ...device, status: allLightsOn ? 'off' : 'on' }
                    : device
                )
              })));
            }}
          >
            <Text style={styles.quickControlIcon}>
              {allLightsOn ? '💡' : '🔦'}
            </Text>
            <Text style={styles.quickControlName}>
              {allLightsOn ? '关闭所有灯' : '打开所有灯'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickControlItem}
            onPress={() => {
              // 切换所有门锁
              setRooms(rooms.map(room => ({
                ...room,
                devices: room.devices.map(device => 
                  device.type === 'lock' 
                    ? { ...device, status: allLocksLocked ? 'unlocked' : 'locked' }
                    : device
                )
              })));
            }}
          >
            <Text style={styles.quickControlIcon}>
              {allLocksLocked ? '🔒' : '🔓'}
            </Text>
            <Text style={styles.quickControlName}>
              {allLocksLocked ? '解锁所有门' : '锁定所有门'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickControlItem}
            onPress={() => {
              // 关闭所有设备
              setRooms(rooms.map(room => ({
                ...room,
                devices: room.devices.map(device => {
                  if (device.type === 'lock') {
                    return { ...device, status: 'locked' };
                  } else if (device.type === 'curtain') {
                    return { ...device, status: 'closed' };
                  } else {
                    return { ...device, status: 'off' };
                  }
                })
              })));
              
              // 重置场景状态
              setScenes(scenes.map(scene => ({
                ...scene,
                isActive: false,
              })));
            }}
          >
            <Text style={styles.quickControlIcon}>⚡</Text>
            <Text style={styles.quickControlName}>关闭所有设备</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer
      title="智能家居"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        {renderRoomSelector()}
        {renderScenes()}
        {renderQuickControls()}
        {renderDevices()}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  // --- General Container ---
  container: {
    flex: 1,
  },

  // --- Room Selector ---
  roomSelectorContainer: {
    marginVertical: theme.spacing.md, // 上下外边距
  },
  roomSelectorContent: {
    paddingHorizontal: theme.spacing.md, // 水平内边距，让两端有空间
  },
  roomItem: {
    paddingHorizontal: theme.spacing.lg, // 房间项左右内边距
    paddingVertical: theme.spacing.sm, // 房间项上下内边距
    backgroundColor: theme.colors.surface, // 背景色
    borderRadius: theme.borderRadius.md, // 圆角
    marginRight: theme.spacing.sm, // 右侧外边距，分隔房间项
  },
  selectedRoomItem: {
    backgroundColor: theme.colors.primary, // 选中时的背景色
  },
  roomName: {
    fontSize: theme.typography.fontSize.md, // 字体大小
    fontWeight: theme.typography.fontWeight.medium, // 字重
    color: theme.colors.textPrimary, // 默认文字颜色
  },
  selectedRoomName: {
    color: theme.colors.onPrimary, // 选中时的文字颜色 (对比色)
  },

  // --- Scenes ---
  scenesCard: {
    marginHorizontal: theme.spacing.md, // 场景卡片左右外边距
    marginBottom: theme.spacing.md, // 场景卡片下外边距
  },
  scenesContainer: {
    paddingVertical: theme.spacing.sm, // 场景滚动区域上下内边距
    paddingHorizontal: theme.spacing.sm, // 场景滚动区域左右内边距（让两端有空间）
  },
  sceneItem: {
    alignItems: 'center', // 居中对齐
    padding: theme.spacing.sm, // 内边距
    borderRadius: theme.borderRadius.md, // 圆角
    borderWidth: 1, // 边框宽度
    borderColor: theme.colors.border, // 边框颜色
    marginRight: theme.spacing.md, // 右侧外边距
    minWidth: 80, // 最小宽度
  },
  activeSceneItem: {
    borderColor: theme.colors.primary, // 激活场景的边框颜色
    backgroundColor: `${theme.colors.primary}1A`, // 激活场景的背景色 (带透明度)
  },
  sceneIcon: {
    fontSize: 24, // 图标大小
    marginBottom: theme.spacing.xs, // 图标和文字间距
  },
  sceneName: {
    fontSize: theme.typography.fontSize.sm, // 场景名称字体大小
    color: theme.colors.textPrimary, // 文字颜色
  },
  activeSceneName: {
    fontWeight: theme.typography.fontWeight.bold, // 激活场景的文字加粗
    color: theme.colors.primary, // 激活场景的文字颜色
  },
  addSceneItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed', // 虚线边框
    minWidth: 80,
    height: '100%', // 让它和场景项高度一致
    minHeight: 70, // 保证一个最小高度
    alignSelf: 'stretch',
  },
  addSceneIcon: {
    fontSize: 24,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  addSceneName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },

  // --- Quick Controls ---
  quickControlsCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  quickControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
  },
  quickControlItem: {
    alignItems: 'center',
    padding: theme.spacing.xs,
  },
  quickControlIcon: {
    fontSize: 28,
    marginBottom: theme.spacing.xs,
  },
  quickControlName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // --- Devices ---
  devicesCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  devicesGrid: {
    flexDirection: 'row', // 水平排列
    flexWrap: 'wrap', // 自动换行
    justifyContent: 'space-between', // 两端对齐，中间均匀分布
    paddingTop: theme.spacing.sm, // 网格顶部内边距
  },
  deviceItem: {
    width: '48%', // 每行大约放2个，留出间隙
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg, // 设备卡片圆角大一些
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start', // 内容左对齐
    ...Platform.select({ // 添加阴影
      ios: theme.shadows.ios.sm,
      android: theme.shadows.android.sm,
    }),
    minHeight: 110, // 保证最小高度
  },
  disconnectedDevice: {
    opacity: 0.5, // 离线设备降低透明度
  },
  deviceIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.md, // 图标和名称间距
  },
  deviceName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  deviceStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  deviceStatusOn: {
    color: theme.colors.success, // 开启状态用成功色
    fontWeight: theme.typography.fontWeight.medium,
  },
  deviceStatusOff: {
    // 保持默认 textSecondary
  },
  deviceStatusLocked: {
    color: theme.colors.error, // 锁定状态用错误色
    fontWeight: theme.typography.fontWeight.medium,
  },
  deviceStatusUnlocked: {
    color: theme.colors.success, // 解锁用成功色
    fontWeight: theme.typography.fontWeight.medium,
  },
  thermostatControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  thermostatButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  thermostatButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  thermostatValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  addDeviceItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center', // 内容居中
    justifyContent: 'center', // 内容居中
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    minHeight: 110,
  },
  addDeviceIcon: {
    fontSize: 28,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  addDeviceName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
  },
});
export default SmartHomeScreen;