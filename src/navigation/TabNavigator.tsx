import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import theme from '../theme';
import Icon from 'react-native-vector-icons/FontAwesome'; // 确保已安装 react-native-vector-icons

import AssistantScreen from '../screens/assistant/AssistantScreen';
import CalendarScreen from '../screens/scheduler/CalendarScreen';
import TasksScreen from '../screens/scheduler/TasksScreen';
import MeetingAssistantScreen from '../screens/productivity/MeetingAssistantScreen';
import NotesScreen from '../screens/productivity/NotesScreen';
import DeviceManagementScreen from '../screens/iot/DeviceManagementScreen';
import SceneManagementScreen from '../screens/iot/SceneManagementScreen';
import SmartHomeScreen from '../screens/iot/SmartHomeScreen';
import CreativeStudioScreen from '../screens/creative/CreativeStudioScreen';

// 导航类型定义
export type TabNavigatorParamList = {
    Assistant: undefined;
    Scheduler: undefined; // 注意 Scheduler 在这里代表 CalendarScreen
    Tasks: undefined;     // TasksScreen 独立的 Tab
    ProductivityMeeting: undefined; // 更明确的 Productivity Tab 名称
    ProductivityNotes: undefined;   // Notes Tab 独立的 Tab
    IoTDevices: undefined;        // IoT 设备管理
    IoTScenes: undefined;         // IoT 场景管理
    IoTSmartHome: undefined;      // 智能家居
    Creative: undefined;
};

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

// TabBarIcon 组件 (可以考虑移动到 components/common)
const TabBarIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
    return <Icon name={name} color={color} size={size} />;
};


const TabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Assistant"
                component={AssistantScreen}
                options={{
                    tabBarLabel: '助手',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="magic" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Scheduler"
                component={CalendarScreen}
                options={{
                    tabBarLabel: '日程',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="calendar-o" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Tasks"
                component={TasksScreen}
                options={{
                    tabBarLabel: '任务',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="tasks" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="ProductivityMeeting"
                component={MeetingAssistantScreen}
                options={{
                    tabBarLabel: '会议助理',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="microphone" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="ProductivityNotes"
                component={NotesScreen}
                options={{
                    tabBarLabel: '笔记',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="sticky-note-o" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="IoTDevices"
                component={DeviceManagementScreen}
                options={{
                    tabBarLabel: '设备',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="usb" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="IoTScenes"
                component={SceneManagementScreen}
                options={{
                    tabBarLabel: '场景',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="sun-o" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="IoTSmartHome"
                component={SmartHomeScreen}
                options={{
                    tabBarLabel: '家居',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Creative"
                component={CreativeStudioScreen}
                options={{
                    tabBarLabel: '创意',
                    tabBarIcon: ({ color, size }) => (
                        <TabBarIcon name="paint-brush" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;