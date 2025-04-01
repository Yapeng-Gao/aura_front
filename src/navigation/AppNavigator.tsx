import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useAppSelector } from '../store/hooks'; // 导入类型化的 useSelector
import theme from '../theme'; // 导入主题
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
// import SettingsScreen from '../screens/settings/SettingsScreen';
import AssistantScreen from '../screens/assistant/AssistantScreen';
import CalendarScreen from '../screens/scheduler/CalendarScreen';
import TasksScreen from '../screens/scheduler/TasksScreen';
import MeetingAssistantScreen from '../screens/productivity/MeetingAssistantScreen';
import NotesScreen from '../screens/productivity/NotesScreen';
import DeviceManagementScreen from '../screens/iot/DeviceManagementScreen';
import SceneManagementScreen from '../screens/iot/SceneManagementScreen';
import SmartHomeScreen from '../screens/iot/SmartHomeScreen';
import CreativeStudioScreen from '../screens/creative/CreativeStudioScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
// 导航类型定义
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Assistant: undefined;
  Scheduler: undefined;
  Productivity: undefined;
  IoT: undefined;
  Creative: undefined;
};

// 创建导航器
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// 导航配置
const AppNavigator: React.FC = () => {
    // 从 Redux store 获取认证状态
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    // 可能还需要获取加载状态，以显示加载指示器直到认证状态确定
    // const authLoading = useAppSelector((state) => state.auth.loading);

    // if (authLoading) {
    //   // 可以显示启动屏或加载指示器
    //   return <SplashScreen />;
    // }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    // 用户已认证，显示主应用流程
                    <>
                        <RootStack.Screen name="Main" component={MainTabNavigator} />
                        {/* Settings 屏幕可以放在这里，或者嵌套在 Main 的某个 Stack 里 */}
                        {/*<RootStack.Screen name="Settings" component={SettingsScreen} />*/}
                        {/* 其他需要认证的顶级屏幕... */}
                    </>
                ) : (
                    // 用户未认证，显示认证流程
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

// 认证导航器

const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// 主标签导航器

const MainTabNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={{
          tabBarActiveTintColor: theme.colors.primary, // <--- 使用主题颜色
          tabBarInactiveTintColor: theme.colors.textSecondary, // <--- 使用主题颜色
          tabBarStyle: {
              backgroundColor: theme.colors.surface, // <--- 使用主题颜色
              borderTopWidth: 1,
              borderTopColor: theme.colors.border, // <--- 使用主题颜色
              paddingBottom: 5, // 根据需要调整 padding
              paddingTop: 5,
              height: 60, // 可能需要设置固定高度
        },
        headerShown: false,
      }}
    >
      <MainTab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarLabel: '助手',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="assistant" color={color} size={size} />
          ),
        }}
      />
      <MainTab.Screen
        name="Scheduler"
        component={CalendarScreen}
        options={{
          tabBarLabel: '日程',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="calendar-today" color={color} size={size} />
          ),
        }}
      />
        <MainTab.Screen
            name="Scheduler"
            component={TasksScreen}
            options={{
                tabBarLabel: '任务',
                tabBarIcon: ({ color, size }) => (
                    <TabBarIcon name="task-today" color={color} size={size} />
                ),
            }}
        />
      <MainTab.Screen
        name="Productivity"
        component={MeetingAssistantScreen}
        options={{
          tabBarLabel: '会议助理',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="work" color={color} size={size} />
          ),
        }}
      />
        <MainTab.Screen
            name="Productivity"
            component={NotesScreen}
            options={{
                tabBarLabel: '笔记',
                tabBarIcon: ({ color, size }) => (
                    <TabBarIcon name="work" color={color} size={size} />
                ),
            }}
        />
      <MainTab.Screen
        name="IoT"
        component={DeviceManagementScreen}
        options={{
          tabBarLabel: '设备管理',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="devices" color={color} size={size} />
          ),
        }}
      />
        <MainTab.Screen
            name="IoT"
            component={SceneManagementScreen}
            options={{
                tabBarLabel: '场景管理',
                tabBarIcon: ({ color, size }) => (
                    <TabBarIcon name="devices" color={color} size={size} />
                ),
            }}
        />
        <MainTab.Screen
            name="IoT"
            component={SmartHomeScreen}
            options={{
                tabBarLabel: '智能房间',
                tabBarIcon: ({ color, size }) => (
                    <TabBarIcon name="devices" color={color} size={size} />
                ),
            }}
        />
      <MainTab.Screen
        name="Creative"
        component={CreativeStudioScreen}
        options={{
          tabBarLabel: '创意',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="brush" color={color} size={size} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
};


const TabBarIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
    return <Icon name={name} color={color} size={size} />;
};



export default AppNavigator;
