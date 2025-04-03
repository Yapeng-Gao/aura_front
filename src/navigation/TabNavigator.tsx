import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import TabBarIcon from '../components/common/TabBarIcon';

// 主屏幕组件
import SmartHomeScreen from '../screens/iot/SmartHomeScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';

// Assistant 相关
import AIAssistantScreen from '../screens/assistant/AIAssistantScreen';
import AISettingsScreen from '../screens/assistant/AISettingsScreen';

// Productivity 相关
import MeetingAssistantScreen from '../screens/productivity/MeetingAssistantScreen';
import NotesScreen from '../screens/productivity/NotesScreen';
import CalendarScreen from '../screens/scheduler/CalendarScreen';
import TasksScreen from '../screens/scheduler/TasksScreen';

// IoT 相关
import DeviceManagementScreen from '../screens/iot/DeviceManagementScreen';
import SceneManagementScreen from '../screens/iot/SceneManagementScreen';

const Tab = createBottomTabNavigator();
const AssistantStack = createStackNavigator();
const ProductivityStack = createStackNavigator();
const IoTStack = createStackNavigator();

// 内联定义 Stack 导航器
const AssistantStackNavigator = () => (
    <AssistantStack.Navigator screenOptions={{ headerShown: false }}>
        <AssistantStack.Screen name="AIAssistant" component={AIAssistantScreen} />
        <AssistantStack.Screen name="AISettings" component={AISettingsScreen} />
    </AssistantStack.Navigator>
);

const ProductivityStackNavigator = () => (
    <ProductivityStack.Navigator screenOptions={{ headerShown: false }}>
        <ProductivityStack.Screen name="Meeting" component={MeetingAssistantScreen} />
        <ProductivityStack.Screen name="Notes" component={NotesScreen} />
        <ProductivityStack.Screen name="Calendar" component={CalendarScreen} />
        <ProductivityStack.Screen name="Tasks" component={TasksScreen} />
    </ProductivityStack.Navigator>
);

const IoTStackNavigator = () => (
    <IoTStack.Navigator screenOptions={{ headerShown: false }}>
        <IoTStack.Screen name="Devices" component={DeviceManagementScreen} />
        <IoTStack.Screen name="Scenes" component={SceneManagementScreen} />
        <IoTStack.Screen name="SmartHome" component={SmartHomeScreen} />
    </IoTStack.Navigator>
);

// 主 Tab 导航器
const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            headerShown: false
        }}
    >
        <Tab.Screen
            name="Home"
            component={SmartHomeScreen}
            options={{
                tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                tabBarLabel: '首页'
            }}
        />
        <Tab.Screen
            name="Assistant"
            component={AssistantStackNavigator}
            options={{
                tabBarIcon: ({ color }) => <TabBarIcon name="robot" color={color} />,
                tabBarLabel: '助手'
            }}
        />
        <Tab.Screen
            name="Productivity"
            component={ProductivityStackNavigator}
            options={{
                tabBarIcon: ({ color }) => <TabBarIcon name="tasks" color={color} />,
                tabBarLabel: '效率'
            }}
        />
        <Tab.Screen
            name="IoT"
            component={IoTStackNavigator}
            options={{
                tabBarIcon: ({ color }) => <TabBarIcon name="smartphone" color={color} />,
                tabBarLabel: '物联网'
            }}
        />
        <Tab.Screen
            name="Profile"
            component={UserProfileScreen}
            options={{
                tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
                tabBarLabel: '我的'
            }}
        />
    </Tab.Navigator>
);

export default TabNavigator;