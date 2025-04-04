import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import TabBarIcon from '../components/common/TabBarIcon';

// 主屏幕组件
import HomeScreen from '../screens/home/HomeScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';

// Assistant 相关
import AssistantHomeScreen from '../screens/assistant/AssistantHomeScreen';
import AIAssistantScreen from '../screens/assistant/AIAssistantScreen';
import AISettingsScreen from '../screens/assistant/AISettingsScreen';
import { default as AssistantMeetingScreen } from '../screens/assistant/MeetingAssistantScreen';
import WritingAssistantScreen from '../screens/assistant/WritingAssistantScreen';
import CodeAssistantScreen from '../screens/assistant/CodeAssistantScreen';
import ImageAssistantScreen from '../screens/assistant/ImageAssistantScreen';
import VoiceAssistantScreen from '../screens/assistant/VoiceAssistantScreen';

// Productivity 相关
import ProductivityHomeScreen from '../screens/productivity/ProductivityHomeScreen';
import { default as ProductivityMeetingScreen } from '../screens/productivity/MeetingAssistantScreen';
import NotesScreen from '../screens/productivity/NotesScreen';
import CalendarScreen from '../screens/scheduler/CalendarScreen';
import TasksScreen from '../screens/scheduler/TasksScreen';

// IoT 相关
import DeviceManagementScreen from '../screens/iot/DeviceManagementScreen';
import SceneManagementScreen from '../screens/iot/SceneManagementScreen';
import SmartHomeScreen from '../screens/iot/SmartHomeScreen';

const Tab = createBottomTabNavigator();
const AssistantStack = createStackNavigator();
const ProductivityStack = createStackNavigator();
const IoTStack = createStackNavigator();

// 内联定义 Stack 导航器
const AssistantStackNavigator = () => (
    <AssistantStack.Navigator screenOptions={{ headerShown: false }}>
        <AssistantStack.Screen name="AssistantHome" component={AssistantHomeScreen} />
        <AssistantStack.Screen name="AIAssistant" component={AIAssistantScreen} />
        <AssistantStack.Screen name="AISettings" component={AISettingsScreen} />
        <AssistantStack.Screen name="MeetingAssistant" component={AssistantMeetingScreen} />
        <AssistantStack.Screen name="WritingAssistant" component={WritingAssistantScreen} />
        <AssistantStack.Screen name="CodeAssistant" component={CodeAssistantScreen} />
        <AssistantStack.Screen name="ImageAssistant" component={ImageAssistantScreen} />
        <AssistantStack.Screen name="VoiceAssistant" component={VoiceAssistantScreen} />
    </AssistantStack.Navigator>
);

const ProductivityStackNavigator = () => (
    <ProductivityStack.Navigator screenOptions={{ headerShown: false }}>
        <ProductivityStack.Screen name="ProductivityHome" component={ProductivityHomeScreen} />
        <ProductivityStack.Screen name="Meeting" component={ProductivityMeetingScreen} />
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
            component={HomeScreen}
            options={{
                tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                tabBarLabel: '首页'
            }}
        />
        <Tab.Screen
            name="Assistant"
            component={AssistantStackNavigator}
            options={{
                tabBarIcon: ({ color }) => <TabBarIcon name="magic" color={color} />,
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
                tabBarIcon: ({ color }) => <TabBarIcon name="mobile" color={color} />,
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