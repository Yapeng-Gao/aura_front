import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SmartHomeScreen from '../screens/iot/SmartHomeScreen';
import DeviceDetailScreen from '../screens/iot/DeviceDetailScreen';
import DeviceManagementScreen from '../screens/iot/DeviceManagementScreen';
import SceneManagementScreen from '../screens/iot/SceneManagementScreen';
import SystemStatusScreen from '../screens/iot/SystemStatusScreen';
import DeviceSearchScreen from '../screens/iot/DeviceSearchScreen';
import AddDeviceScreen from '../screens/iot/AddDeviceScreen';
import RoomDetailScreen from '../screens/iot/RoomDetailScreen';
import AddRoomScreen from '../screens/iot/AddRoomScreen';
import { IoTStackParamList } from '../types/navigation';

const Stack = createStackNavigator<IoTStackParamList>();

const IoTNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SmartHome"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="SmartHome" component={SmartHomeScreen} />
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
      <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
      <Stack.Screen name="SceneManagement" component={SceneManagementScreen} />
      <Stack.Screen name="DeviceSearch" component={DeviceSearchScreen} />
      <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="AddRoom" component={AddRoomScreen} />
      <Stack.Screen name="SystemStatus" component={SystemStatusScreen} />
    </Stack.Navigator>
  );
};

export default IoTNavigator; 