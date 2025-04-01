// 用户模型
export interface User {
    id: string;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    roles: Role[];
}

// 角色模型
export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: Permission[];
}

// 权限模型
export interface Permission {
    id: string;
    name: string;
    code: string;
    description?: string;
}

// 日程模型
export interface Schedule {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    location?: string;
    attendees?: User[];
    creator: User;
    createdAt: string;
    updatedAt: string;
}

// IoT设备模型
export interface IoTDevice {
    id: string;
    name: string;
    type: string;
    status: 'online' | 'offline' | 'error';
    lastActiveAt?: string;
    properties: Record<string, any>;
    owner: User;
}

// 创意内容模型
export interface CreativeContent {
    id: string;
    title: string;
    type: 'image' | 'video' | 'audio' | 'text';
    content: string;
    tags: string[];
    creator: User;
    createdAt: string;
    updatedAt: string;
}