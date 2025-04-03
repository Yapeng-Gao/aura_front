import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../store/hooks';
import AuthNavigator from './AuthNavigator'; // 导入 AuthNavigator
import TabNavigator from './TabNavigator';   // 导入 TabNavigator
import { RootStackParamList } from './types'; // 假设你创建了 types.ts 并移动了 RootStackParamList

// 导航类型定义 (RootStackParamList 保留在此文件中，或者移动到 types.ts)
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    // Settings: undefined; // Settings 如果作为顶级路由，保留在这里
};

const RootStack = createStackNavigator<RootStackParamList>();

// TabBarIcon 组件 (如果 TabNavigator 不再需要，可以移除或移动到更通用的位置)
// 这里为了演示方便，假设 TabNavigator 仍然需要，则保留在这里
import Icon from 'react-native-vector-icons/FontAwesome';
const TabBarIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
    return <Icon name={name} color={color} size={size} />;
};


const AppNavigator: React.FC = () => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const token = useAppSelector((state) => state.auth.token); // 也检查一下 token

    // 每次 AppNavigator 渲染时都打印状态
    console.log(`AppNavigator Rendering - isAuthenticated: ${isAuthenticated}, Token exists: ${!!token}`);
    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <RootStack.Screen name="Main" component={TabNavigator} />
                        {/* <RootStack.Screen name="Settings" component={SettingsScreen} /> */}
                    </>
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};


export default AppNavigator;