import { NavigatorScreenParams } from '@react-navigation/native';

// 定义所有路由参数类型
export type RootStackParamList = {
    Auth: undefined;
    Main: NavigatorScreenParams<TabParamList>;
    UserProfile: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type TabParamList = {
    Home: undefined;
    Assistant: NavigatorScreenParams<AssistantStackParamList>;
    Productivity: NavigatorScreenParams<ProductivityStackParamList>;
    IoT: NavigatorScreenParams<IoTStackParamList>;
    Profile: undefined;
};

export type AssistantStackParamList = {
    AIAssistant: undefined;
    AISettings: undefined;
};

export type ProductivityStackParamList = {
    Meeting: undefined;
    Notes: undefined;
    Calendar: undefined;
    Tasks: undefined;
};

export type IoTStackParamList = {
    Devices: undefined;
    Scenes: undefined;
    SmartHome: undefined;
};