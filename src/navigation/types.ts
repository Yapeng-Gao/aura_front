import { NavigatorScreenParams } from '@react-navigation/native';

// 定义所有路由参数类型
export type RootStackParamList = {
    Home: undefined;
    Auth: undefined;
    EditProfile: undefined;
    PersonalInfo: undefined;
    SecuritySettings: undefined;
    NotificationSettings: undefined;
    PrivacySettings: undefined;
    HelpSupport: undefined;
    About: undefined;
    MembershipUpgrade: undefined;
    MeetingDetail: { meetingId: string };
    ThemeSettings: undefined;
    LanguageSettings: undefined;
    PrivacyPolicy: undefined;
    TermsOfService: undefined;
    HelpCenter: undefined;
    UserAnalytics: undefined;
    Feedback: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type TabParamList = {
    Home: undefined;
    SmartHome: undefined;
    Tasks: undefined;
    Profile: undefined;
};

export type AssistantStackParamList = {
    AssistantHome: undefined;
    AIAssistant: undefined;
    AISettings: undefined;
    MeetingAssistant: undefined;
    WritingAssistant: undefined;
    CodeAssistant: undefined;
    ImageAssistant: undefined;
    VoiceAssistant: undefined;
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