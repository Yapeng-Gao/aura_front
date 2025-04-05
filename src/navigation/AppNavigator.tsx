import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../store/hooks';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import SecuritySettingsScreen from '../screens/profile/SecuritySettingsScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/profile/PrivacySettingsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import MembershipUpgradeScreen from '../screens/profile/MembershipUpgradeScreen';
import MeetingDetailScreen from '../screens/assistant/MeetingDetailScreen';
import ThemeSettingsScreen from '../screens/profile/ThemeSettingsScreen';
import LanguageSettingsScreen from '../screens/profile/LanguageSettingsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/profile/TermsOfServiceScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import UserAnalyticsScreen from '../screens/analytics/UserAnalyticsScreen';
import useTranslation from '../hooks/useTranslation';
import FeedbackScreen from '../screens/profile/FeedbackScreen';

const RootStack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const { t } = useTranslation();

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <RootStack.Screen name="Main" component={TabNavigator} />
                        <RootStack.Screen 
                            name="EditProfile" 
                            component={EditProfileScreen}
                            options={{
                                headerShown: true,
                                title: '编辑个人资料',
                            }}
                        />
                        <RootStack.Screen 
                            name="PersonalInfo" 
                            component={PersonalInfoScreen}
                            options={{
                                headerShown: true,
                                title: '个人信息',
                            }}
                        />
                        <RootStack.Screen 
                            name="SecuritySettings" 
                            component={SecuritySettingsScreen}
                            options={{
                                headerShown: true,
                                title: '安全设置',
                            }}
                        />
                        <RootStack.Screen 
                            name="NotificationSettings" 
                            component={NotificationSettingsScreen}
                            options={{
                                headerShown: true,
                                title: '通知设置',
                            }}
                        />
                        <RootStack.Screen 
                            name="PrivacySettings" 
                            component={PrivacySettingsScreen}
                            options={{
                                headerShown: true,
                                title: '隐私设置',
                            }}
                        />
                        <RootStack.Screen 
                            name="HelpSupport" 
                            component={HelpSupportScreen}
                            options={{
                                headerShown: true,
                                title: '帮助与支持',
                            }}
                        />
                        <RootStack.Screen 
                            name="About" 
                            component={AboutScreen}
                            options={{
                                headerShown: true,
                                title: '关于',
                            }}
                        />
                        <RootStack.Screen 
                            name="MembershipUpgrade" 
                            component={MembershipUpgradeScreen}
                            options={{
                                headerShown: true,
                                title: '会员升级',
                            }}
                        />
                        <RootStack.Screen 
                            name="ThemeSettings" 
                            component={ThemeSettingsScreen}
                            options={{
                                headerShown: true,
                                title: '主题设置',
                            }}
                        />
                        <RootStack.Screen 
                            name="LanguageSettings" 
                            component={LanguageSettingsScreen}
                            options={{
                                headerShown: true,
                                title: '语言设置',
                            }}
                        />
                        <RootStack.Screen 
                            name="PrivacyPolicy" 
                            component={PrivacyPolicyScreen}
                            options={{
                                headerShown: true,
                                title: '隐私政策',
                            }}
                        />
                        <RootStack.Screen 
                            name="TermsOfService" 
                            component={TermsOfServiceScreen}
                            options={{
                                headerShown: true,
                                title: '服务条款',
                            }}
                        />
                        <RootStack.Screen 
                            name="HelpCenter" 
                            component={HelpCenterScreen}
                            options={{
                                headerShown: true,
                                title: '帮助中心',
                            }}
                        />
                        <RootStack.Screen 
                            name="MeetingDetail" 
                            component={MeetingDetailScreen}
                            options={{
                                headerShown: false,
                            }}
                        />
                        <RootStack.Screen 
                            name="UserAnalytics" 
                            component={UserAnalyticsScreen}
                            options={{
                                headerShown: false,
                                title: t('analytics.title'),
                            }}
                        />
                        <RootStack.Screen 
                            name="Feedback" 
                            component={FeedbackScreen} 
                            options={{ headerShown: false }} 
                        />
                    </>
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;