import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import TabBarIcon from '../components/common/TabBarIcon';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';

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
const TabNavigator = () => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: isDarkMode ? colors.dark.background : colors.background,
                    borderTopColor: isDarkMode ? colors.dark.border : colors.border,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: isDarkMode ? colors.dark.textSecondary : colors.textSecondary,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: '首页',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Assistant"
                component={AssistantStackNavigator}
                options={{
                    tabBarLabel: '助手',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="magic" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="SmartHome"
                component={IoTStackNavigator}
                options={{
                    tabBarLabel: '物联网',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="mobile" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Tasks"
                component={ProductivityStackNavigator}
                options={{
                    tabBarLabel: '效率',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="check-circle" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={UserProfileScreen}
                options={{
                    tabBarLabel: '我的',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="user" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;