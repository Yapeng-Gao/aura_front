import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../theme';
import { DeviceResponse } from '../../types/iot';

interface RoomCardProps {
  room: {
    room_id: string;
    name: string;
    icon?: string;
    image?: string | null;
    devices_count: number;
    active_devices_count?: number;
  };
  devices?: DeviceResponse[];
  onPress: () => void;
  isDarkMode?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  devices = [],
  onPress,
  isDarkMode = false
}) => {
  // 计算房间内活跃的设备数量
  const activeDevicesCount = room.active_devices_count !== undefined 
    ? room.active_devices_count 
    : devices.filter(device => device.state?.power === 'on').length;
  
  // 生成默认图片
  const getDefaultImage = () => {
    const roomImages: Record<string, any> = {
      'living_room': require('../../../assets/images/living_room.png'),
      'bedroom': require('../../../assets/images/bedroom.png'),
      'kitchen': require('../../../assets/images/kitchen.png'),
      'bathroom': require('../../../assets/images/bathroom.png'),
      'office': require('../../../assets/images/office.png'),
      'default': require('../../../assets/images/default_room.png')
    };

    // 尝试匹配房间名称关键词
    const roomName = room.name.toLowerCase();
    if (roomName.includes('living')) return roomImages.living_room;
    if (roomName.includes('bed')) return roomImages.bedroom;
    if (roomName.includes('kitchen')) return roomImages.kitchen;
    if (roomName.includes('bath')) return roomImages.bathroom;
    if (roomName.includes('office') || roomName.includes('study')) return roomImages.office;
    
    return roomImages.default;
  };

  // 获取房间图标
  const getRoomIcon = () => {
    const defaultIcon = 'home-outline';
    
    if (room.icon) return room.icon;
    
    const roomName = room.name.toLowerCase();
    if (roomName.includes('living')) return 'tv-outline';
    if (roomName.includes('bed')) return 'bed-outline';
    if (roomName.includes('kitchen')) return 'restaurant-outline';
    if (roomName.includes('bath')) return 'water-outline';
    if (roomName.includes('office') || roomName.includes('study')) return 'desktop-outline';
    
    return defaultIcon;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isDarkMode && styles.containerDark
      ]} 
      onPress={onPress}
    >
      <ImageBackground
        source={room.image ? { uri: room.image } : getDefaultImage()}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay} />
        
        <View style={styles.iconContainer}>
          <Icon 
            name={getRoomIcon()} 
            size={22} 
            color="#FFFFFF" 
          />
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {room.devices_count} 设备 • {activeDevicesCount} 活跃
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    height: 120,
    backgroundColor: theme.colors.cardBackground,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  containerDark: {
    backgroundColor: theme.dark.colors.cardBackground,
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  roomName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: '#FFFFFF',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default RoomCard; 