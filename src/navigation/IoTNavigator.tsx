import DeviceDetailScreen from '../screens/iot/DeviceDetailScreen';
import DeviceManagementScreen from '../screens/iot/DeviceManagementScreen';
import SceneManagementScreen from '../screens/iot/SceneManagementScreen';
import SystemStatusScreen from '../screens/iot/SystemStatusScreen';

const Stack = createStackNavigator();

const IoTNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
      <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
      <Stack.Screen name="SceneManagement" component={SceneManagementScreen} />
      <Stack.Screen name="SystemStatus" component={SystemStatusScreen} />
    </Stack.Navigator>
  );
};

export default IoTNavigator; 