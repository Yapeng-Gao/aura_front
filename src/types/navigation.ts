import { NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
    DeviceList: undefined;
    DeviceDetail: { deviceId: string };
    AddDevice: undefined;
    EditDevice: { deviceId: string };
    SceneList: undefined;
    SceneDetail: { sceneId: string };
    AddScene: undefined;
    EditScene: { sceneId: string };
    RoomList: undefined;
    RoomDetail: { roomId: string };
    AddRoom: undefined;
    DeviceSettings: { deviceId: string };
    Home: undefined;
    Analytics: undefined;
    AIAssistant: undefined;
    AISettings: undefined;
    Calendar: undefined;
    DeviceManagement: undefined;
    EventDetail: { eventId: string };
    ScheduleEvent: undefined;
    TaskList: undefined;
    SmartHome: undefined;
    MeetingAI: { meetingId?: string };
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
    SmartHome: undefined;
    DeviceList: undefined;
    DeviceDetail: { deviceId: string };
    AddDevice: { roomId?: string } | undefined;
    EditDevice: { deviceId: string };
    RoomDetail: { roomId: string };
    AddRoom: undefined;
    EditRoom: { roomId: string };
    SceneDetail: { sceneId: string };
    AddScene: undefined;
    EditScene: { sceneId: string };
    DeviceSearch: undefined;
    Notifications: undefined;
    RoomManagement: undefined;
    SceneManagement: undefined;
    SystemStatus: undefined;
};

// 创意内容栈参数
export type CreativeStackParamList = {
    CreativeGallery: undefined;
    CreativeDetail: { id: string };
    CreativeEditor: { id?: string };
};

// 助手导航参数
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

// 所有可能的路由名称
export type RouteName = keyof RootStackParamList |
    keyof AuthStackParamList |
    keyof MainTabParamList |
    keyof SchedulerStackParamList |
    keyof IoTStackParamList |
    keyof CreativeStackParamList |
    keyof AssistantStackParamList;

// 导航道具类型
export type IoTNavigationProp<T extends keyof IoTStackParamList> = StackNavigationProp<IoTStackParamList, T>;

// 路由道具类型
export type IoTRouteProp<T extends keyof IoTStackParamList> = RouteProp<IoTStackParamList, T>;

// 导航和路由道具接口
export interface IoTScreenProps<T extends keyof IoTStackParamList> {
  navigation: IoTNavigationProp<T>;
  route: IoTRouteProp<T>;
}

// AI助手导航类型
export type AIAssistantScreenNavigationProp = NativeStackNavigationProp<AssistantStackParamList, 'AIAssistant'>;

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;