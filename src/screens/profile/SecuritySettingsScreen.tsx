import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type SecuritySettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SecuritySettings'>;

const SecuritySettingsScreen: React.FC = () => {
    const navigation = useNavigation<SecuritySettingsScreenNavigationProp>();
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const handleBiometricToggle = async (value: boolean) => {
        try {
            // TODO: 调用生物识别 API
            if (value) {
                // 请求生物识别权限
                Alert.alert(
                    '启用生物识别',
                    '是否使用指纹或面部识别登录？',
                    [
                        {
                            text: '取消',
                            style: 'cancel',
                            onPress: () => setBiometricEnabled(false),
                        },
                        {
                            text: '确定',
                            onPress: () => setBiometricEnabled(true),
                        },
                    ]
                );
            } else {
                setBiometricEnabled(false);
            }
        } catch (error) {
            console.error('生物识别设置失败:', error);
            Alert.alert('错误', '设置生物识别失败，请重试');
        }
    };

    const handleTwoFactorToggle = async (value: boolean) => {
        try {
            if (value) {
                // 显示设置两步验证的引导
                Alert.alert(
                    '设置两步验证',
                    '您需要完成以下步骤：\n1. 下载认证器应用\n2. 扫描二维码\n3. 输入验证码',
                    [
                        {
                            text: '取消',
                            style: 'cancel',
                            onPress: () => setTwoFactorEnabled(false),
                        },
                        {
                            text: '开始设置',
                            onPress: () => {
                                // TODO: 实现两步验证设置流程
                                setTwoFactorEnabled(true);
                            },
                        },
                    ]
                );
            } else {
                setTwoFactorEnabled(false);
            }
        } catch (error) {
            console.error('两步验证设置失败:', error);
            Alert.alert('错误', '设置两步验证失败，请重试');
        }
    };

    const handleChangePassword = () => {
        Alert.alert(
            '修改密码',
            '请选择修改密码的方式：',
            [
                {
                    text: '通过短信验证码',
                    onPress: () => {
                        // TODO: 实现短信验证码修改密码
                        console.log('通过短信验证码修改密码');
                    },
                },
                {
                    text: '通过邮箱验证码',
                    onPress: () => {
                        // TODO: 实现邮箱验证码修改密码
                        console.log('通过邮箱验证码修改密码');
                    },
                },
                {
                    text: '取消',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleManageDevices = () => {
        // TODO: 实现设备管理页面
        console.log('打开设备管理页面');
    };

    return (
        <ScreenContainer
            title="安全设置"
            backgroundColor={theme.colors.background}
        >
            <ScrollView style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>登录安全</Text>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>生物识别登录</Text>
                            <Text style={styles.settingDescription}>使用指纹或面部识别登录</Text>
                        </View>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={handleBiometricToggle}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    </View>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>两步验证</Text>
                            <Text style={styles.settingDescription}>登录时需要进行二次验证</Text>
                        </View>
                        <Switch
                            value={twoFactorEnabled}
                            onValueChange={handleTwoFactorToggle}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>密码管理</Text>
                    <TouchableOpacity style={styles.settingRow} onPress={handleChangePassword}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>修改密码</Text>
                            <Text style={styles.settingDescription}>定期更改密码以提高安全性</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>设备管理</Text>
                    <TouchableOpacity style={styles.settingRow} onPress={handleManageDevices}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>已登录设备</Text>
                            <Text style={styles.settingDescription}>查看和管理已登录的设备</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.md,
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    settingDescription: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    arrow: {
        fontSize: 24,
        color: theme.colors.textSecondary,
    },
});

export default SecuritySettingsScreen;