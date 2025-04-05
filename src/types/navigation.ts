import { NavigatorScreenParams } from '@react-navigation/native';

// 根导航栈参数
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    Settings: undefined;
    NotFound: undefined;
    Feedback: undefined;
    UserProfile: undefined;
    EditProfile: undefined;
    UserAnalytics: undefined;
    LanguageSettings: undefined;
};

// 认证导航栈参数
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string };
};

// 主标签页参数
export type MainTabParamList = {
    Assistant: undefined;
    Scheduler: NavigatorScreenParams<SchedulerStackParamList>;
    Productivity: undefined;
    IoT: NavigatorScreenParams<IoTStackParamList>;
    Creative: NavigatorScreenParams<CreativeStackParamList>;
};

// 日程管理栈参数
export type SchedulerStackParamList = {
    SchedulerHome: undefined;
    SchedulerDetail: { id: string };
    SchedulerCreate: undefined;
    SchedulerEdit: { id: string };
};

// IoT管理栈参数
export type IoTStackParamList = {
    IoTDevices: undefined;
    IoTDeviceDetail: { id: string };
    IoTDeviceSetup: undefined;
};

// 创意内容栈参数
export type CreativeStackParamList = {
    CreativeGallery: undefined;
    CreativeDetail: { id: string };
    CreativeEditor: { id?: string };
};

// 所有可能的路由名称
export type RouteName = keyof RootStackParamList |
    keyof AuthStackParamList |
    keyof MainTabParamList |
    keyof SchedulerStackParamList |
    keyof IoTStackParamList |
    keyof CreativeStackParamList;