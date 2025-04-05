import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../theme';
import { DeviceStateResponse } from '../../types/iot';

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
    const defaultIcon = 'bulb-outline';
    
    if (device.icon) return device.icon;
    
    const deviceType = device.type_id.toLowerCase();
    if (deviceType.includes('light')) return 'bulb-outline';
    if (deviceType.includes('fan')) return 'fan-outline';
    if (deviceType.includes('ac') || deviceType.includes('air')) return 'thermometer-outline';
    if (deviceType.includes('tv')) return 'tv-outline';
    if (deviceType.includes('speaker') || deviceType.includes('audio')) return 'musical-notes-outline';
    if (deviceType.includes('camera')) return 'videocam-outline';
    if (deviceType.includes('lock')) return 'lock-closed-outline';
    if (deviceType.includes('sensor')) return 'analytics-outline';
    if (deviceType.includes('plug') || deviceType.includes('outlet')) return 'flash-outline';
    
    return defaultIcon;
  };
  
  // 获取设备状态样式
  const getStatusStyles = () => {
    const isOn = device.state?.power === 'on';
    const isOnline = device.state?.isOnline !== false; // 默认在线
    
    let statusColor = isOnline ? theme.colors.textSecondary : theme.colors.error;
    let backgroundColor = 'transparent';
    
    if (isOnline && isOn) {
      statusColor = theme.colors.success;
      backgroundColor = `${theme.colors.success}15`; // 15% 透明度
    }
    
    return {
      statusColor,
      backgroundColor
    };
  };

  const { statusColor, backgroundColor } = getStatusStyles();

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? theme.dark.colors.cardBackground : theme.colors.cardBackground },
        { borderColor: isDarkMode ? theme.dark.colors.border : theme.colors.border }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <Icon
          name={getDeviceIcon()}
          size={24}
          color={device.state?.power === 'on' ? theme.colors.primary : 
            (isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary)}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text 
          style={[
            styles.deviceName,
            isDarkMode && { color: theme.dark.colors.textPrimary }
          ]}
          numberOfLines={1}
        >
          {device.name}
        </Text>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text 
            style={[
              styles.statusText,
              isDarkMode && { color: theme.dark.colors.textSecondary }
            ]}
          >
            {device.state?.isOnline === false 
              ? '离线'
              : device.state?.power === 'on' ? '开启' : '关闭'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.powerButton} 
        onPress={onPowerToggle}
        disabled={device.state?.isOnline === false}
      >
        <View style={[
          styles.powerButtonInner,
          device.state?.power === 'on' && styles.powerButtonOn,
          isDarkMode && device.state?.power !== 'on' && styles.powerButtonDark,
          device.state?.isOnline === false && styles.powerButtonDisabled,
        ]}>
          <Icon
            name="power"
            size={16}
            color={device.state?.power === 'on' ? '#FFFFFF' : (
              device.state?.isOnline === false 
                ? theme.colors.textSecondary
                : (isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary)
            )}
          />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  powerButton: {
    padding: 6,
  },
  powerButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  powerButtonOn: {
    backgroundColor: theme.colors.primary,
  },
  powerButtonDark: {
    backgroundColor: '#424242',
  },
  powerButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
  },
});

export default DeviceCard; 