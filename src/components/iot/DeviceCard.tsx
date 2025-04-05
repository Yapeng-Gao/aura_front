import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../theme';

interface DeviceCardProps {
  device: {
    device_id: string;
    name: string;
    icon?: string;
    type_id: string;
    room?: string;
    state?: {
      isOnline: boolean;
      power: string;
      brightness?: number;
      temperature?: number;
      color?: string;
      [key: string]: any;
    };
  };
  onPress: () => void;
  onPowerToggle: () => void;
  isDarkMode?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ 
  device, 
  onPress, 
  onPowerToggle,
  isDarkMode = false
}) => {
  // 获取设备图标
  const getDeviceIcon = () => {
    if (device.icon) return device.icon;
    
    // 根据设备类型选择默认图标
    switch (device.type_id) {
      case 'light':
        return 'bulb-outline';
      case 'thermostat':
        return 'thermometer-outline';
      case 'lock':
        return 'lock-closed-outline';
      case 'camera':
        return 'videocam-outline';
      case 'speaker':
        return 'volume-high-outline';
      case 'switch':
        return 'power-outline';
      default:
        return 'hardware-chip-outline';
    }
  };

  // 获取在线状态文字
  const getStatusText = () => {
    if (!device.state?.isOnline) {
      return '离线';
    }
    
    return device.state?.power === 'on' ? '开启' : '关闭';
  };
  
  // 获取状态颜色
  const getStatusColor = () => {
    if (!device.state?.isOnline) {
      return theme.colors.textSecondary;
    }
    
    return device.state?.power === 'on' ? theme.colors.success : theme.colors.textSecondary;
  };
  
  // 获取设备详情信息
  const getDeviceDetails = () => {
    if (!device.state?.isOnline) return null;
    
    const details = [];
    
    if (device.state.brightness !== undefined) {
      details.push(`亮度: ${device.state.brightness}%`);
    }
    
    if (device.state.temperature !== undefined) {
      details.push(`温度: ${device.state.temperature}°C`);
    }
    
    return details.length > 0 ? details.join(' | ') : null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDarkMode && styles.containerDark
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 设备图标 */}
      <View style={[
        styles.iconContainer,
        device.state?.power === 'on' && styles.activeIconContainer,
        isDarkMode && styles.iconContainerDark,
        isDarkMode && device.state?.power === 'on' && styles.activeIconContainerDark
      ]}>
        <Icon 
          name={getDeviceIcon()} 
          size={24} 
          color={
            device.state?.power === 'on' 
              ? (isDarkMode ? theme.dark.colors.primary : theme.colors.primary)
              : (isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary)
          } 
        />
      </View>
      
      {/* 设备信息 */}
      <View style={styles.infoContainer}>
        <Text style={[
          styles.deviceName,
          isDarkMode && styles.textDark
        ]}>
          {device.name}
        </Text>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: getStatusColor() }
          ]} />
          
          <Text style={[
            styles.statusText,
            isDarkMode && { color: isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary }
          ]}>
            {getStatusText()}
          </Text>
          
          {device.room && (
            <Text style={[
              styles.roomText,
              isDarkMode && { color: isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary }
            ]}>
              | {device.room}
            </Text>
          )}
        </View>
        
        {getDeviceDetails() && (
          <Text style={[
            styles.detailsText,
            isDarkMode && { color: isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary }
          ]}>
            {getDeviceDetails()}
          </Text>
        )}
      </View>
      
      {/* 电源开关 */}
      {device.state?.isOnline && (
        <TouchableOpacity
          style={styles.powerButton}
          onPress={onPowerToggle}
          disabled={!device.state?.isOnline}
        >
          <Icon 
            name={device.state?.power === 'on' ? 'power' : 'power-outline'} 
            size={22} 
            color={
              device.state?.power === 'on' 
                ? (isDarkMode ? theme.dark.colors.primary : theme.colors.primary)
                : (isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary)
            } 
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerDark: {
    backgroundColor: theme.dark.colors.background,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconContainerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0, 120, 255, 0.1)',
  },
  activeIconContainerDark: {
    backgroundColor: 'rgba(0, 120, 255, 0.2)',
  },
  infoContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  textDark: {
    color: theme.dark.colors.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  roomText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  detailsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  powerButton: {
    padding: theme.spacing.sm,
  },
});

export default DeviceCard; 