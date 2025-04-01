# Aura智能生活助手App API设计文档

## 1. API概述

Aura API是一套RESTful API，为Aura智能生活助手App提供后端服务支持。API采用微服务架构，按功能领域划分为多个服务组，每个服务组提供特定领域的功能。API设计遵循RESTful原则，使用JSON作为数据交换格式，JWT进行身份验证。

### 1.1 API基础信息

- **基础URL**: `https://api.aura-assistant.com/v1`
- **API版本**: v1
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
- **认证方式**: OAuth 2.0 + JWT

### 1.2 通用请求头

| 请求头 | 描述 | 是否必须 |
|-------|------|---------|
| `Authorization` | 身份验证令牌，格式为 `Bearer {token}` | 是 |
| `Content-Type` | 内容类型，通常为 `application/json` | 是 |
| `Accept-Language` | 客户端语言偏好，如 `zh-CN` | 否 |
| `X-API-Key` | API密钥（部分公开API可用） | 视情况 |
| `X-Device-ID` | 设备唯一标识符 | 是 |
| `X-App-Version` | 应用版本号 | 是 |

### 1.3 通用响应格式

所有API响应遵循以下统一格式：

```json
{
  "status": "success",
  "code": 200,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2025-03-27T13:20:00Z",
  "requestId": "req-123456789"
}
```

错误响应格式：

```json
{
  "status": "error",
  "code": 400,
  "errors": [
    {
      "code": "INVALID_PARAMETER",
      "field": "email",
      "message": "无效的邮箱格式"
    }
  ],
  "message": "请求参数错误",
  "timestamp": "2025-03-27T13:20:00Z",
  "requestId": "req-123456789"
}
```

### 1.4 状态码使用

| 状态码 | 描述 |
|-------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 204 | 请求成功，无返回内容 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 请求格式正确但语义错误 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

## 2. 认证与授权API

### 2.1 用户注册

- **端点**: `POST /auth/register`
- **描述**: 创建新用户账号
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "张三",
    "phoneNumber": "+8613800138000"
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 201,
    "data": {
      "userId": "usr_123456789",
      "email": "user@example.com",
      "name": "张三",
      "createdAt": "2025-03-27T13:20:00Z"
    },
    "message": "用户注册成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 2.2 用户登录

- **端点**: `POST /auth/login`
- **描述**: 用户登录并获取访问令牌
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "deviceInfo": {
      "deviceId": "dev_123456789",
      "deviceName": "iPhone 15 Pro",
      "osVersion": "iOS 18.0"
    }
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer",
      "user": {
        "userId": "usr_123456789",
        "name": "张三",
        "email": "user@example.com",
        "profileImage": "https://assets.aura-assistant.com/profiles/default.png"
      }
    },
    "message": "登录成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 2.3 刷新令牌

- **端点**: `POST /auth/refresh-token`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求体**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    },
    "message": "令牌刷新成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 2.4 退出登录

- **端点**: `POST /auth/logout`
- **描述**: 使当前令牌失效
- **请求头**: 需要包含有效的 `Authorization` 头
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": null,
    "message": "退出登录成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 2.5 社交媒体登录

- **端点**: `POST /auth/social-login`
- **描述**: 通过第三方社交媒体账号登录
- **请求体**:
  ```json
  {
    "provider": "wechat",
    "accessToken": "third_party_token",
    "deviceInfo": {
      "deviceId": "dev_123456789",
      "deviceName": "iPhone 15 Pro",
      "osVersion": "iOS 18.0"
    }
  }
  ```
- **响应**: 与标准登录响应相同

## 3. 用户管理API

### 3.1 获取用户资料

- **端点**: `GET /users/profile`
- **描述**: 获取当前登录用户的详细资料
- **请求头**: 需要包含有效的 `Authorization` 头
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "userId": "usr_123456789",
      "email": "user@example.com",
      "name": "张三",
      "phoneNumber": "+8613800138000",
      "profileImage": "https://assets.aura-assistant.com/profiles/user123.jpg",
      "preferences": {
        "language": "zh-CN",
        "theme": "dark",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "subscription": {
        "plan": "pro",
        "status": "active",
        "expiresAt": "2026-03-27T00:00:00Z"
      },
      "createdAt": "2025-01-15T08:30:00Z",
      "lastLoginAt": "2025-03-27T13:10:00Z"
    },
    "message": "获取用户资料成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 3.2 更新用户资料

- **端点**: `PATCH /users/profile`
- **描述**: 更新当前用户的资料信息
- **请求头**: 需要包含有效的 `Authorization` 头
- **请求体**:
  ```json
  {
    "name": "李四",
    "phoneNumber": "+8613900139000",
    "preferences": {
      "language": "en-US",
      "theme": "light"
    }
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "userId": "usr_123456789",
      "name": "李四",
      "phoneNumber": "+8613900139000",
      "preferences": {
        "language": "en-US",
        "theme": "light",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "updatedAt": "2025-03-27T13:20:00Z"
    },
    "message": "用户资料更新成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 3.3 上传头像

- **端点**: `POST /users/profile/avatar`
- **描述**: 上传或更新用户头像
- **请求头**: 需要包含有效的 `Authorization` 头，`Content-Type` 为 `multipart/form-data`
- **请求体**: 表单数据，包含 `avatar` 文件字段
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "profileImage": "https://assets.aura-assistant.com/profiles/user123_new.jpg",
      "updatedAt": "2025-03-27T13:20:00Z"
    },
    "message": "头像上传成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 3.4 更新通知设置

- **端点**: `PATCH /users/notification-settings`
- **描述**: 更新用户的通知偏好设置
- **请求头**: 需要包含有效的 `Authorization` 头
- **请求体**:
  ```json
  {
    "email": false,
    "push": true,
    "reminders": true,
    "marketing": false,
    "soundEnabled": true,
    "vibrationEnabled": true,
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "07:00"
    }
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "notificationSettings": {
        "email": false,
        "push": true,
        "reminders": true,
        "marketing": false,
        "soundEnabled": true,
        "vibrationEnabled": true,
        "quietHours": {
          "enabled": true,
          "start": "22:00",
          "end": "07:00"
        }
      },
      "updatedAt": "2025-03-27T13:20:00Z"
    },
    "message": "通知设置更新成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

## 4. AI助手API

### 4.1 发送消息

- **端点**: `POST /assistant/messages`
- **描述**: 向AI助手发送消息并获取回复
- **请求头**: 需要包含有效的 `Authorization` 头
- **请求体**:
  ```json
  {
    "message": "明天下午3点提醒我参加项目会议",
    "messageType": "text",
    "contextId": "ctx_123456789",
    "metadata": {
      "location": {
        "latitude": 39.9042,
        "longitude": 116.4074
      },
      "timezone": "Asia/Shanghai"
    }
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "messageId": "msg_123456789",
      "contextId": "ctx_123456789",
      "response": {
        "text": "好的，我已为您设置明天下午3点的项目会议提醒。需要我添加会议地点或其他详情吗？",
        "type": "text",
        "actions": [
          {
            "type": "viewEvent",
            "label": "查看提醒",
            "payload": {
              "eventId": "evt_123456789"
            }
          },
          {
            "type": "addDetails",
            "label": "添加详情",
            "payload": {
              "eventId": "evt_123456789"
            }
          }
        ],
        "entities": [
          {
            "type": "event",
            "value": {
              "title": "项目会议",
              "startTime": "2025-03-28T15:00:00+08:00",
              "endTime": "2025-03-28T16:00:00+08:00",
              "eventId": "evt_123456789"
            }
          }
        ]
      },
      "createdAt": "2025-03-27T13:20:00Z"
    },
    "message": "消息处理成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 4.2 语音消息处理

- **端点**: `POST /assistant/voice-messages`
- **描述**: 上传语音消息并获取AI助手回复
- **请求头**: 需要包含有效的 `Authorization` 头，`Content-Type` 为 `multipart/form-data`
- **请求体**: 表单数据，包含 `audio` 文件字段和 `contextId`、`metadata` 字段
- **响应**: 与文本消息响应格式相同，但可能包含语音回复URL

### 4.3 图像识别

- **端点**: `POST /assistant/image-recognition`
- **描述**: 上传图像进行识别并获取AI助手回复
- **请求头**: 需要包含有效的 `Authorization` 头，`Content-Type` 为 `multipart/form-data`
- **请求体**: 表单数据，包含 `image` 文件字段和可选的 `query` 文本字段
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "messageId": "msg_123456789",
      "recognition": {
        "objects": ["书桌", "笔记本电脑", "咖啡杯"],
        "text": ["会议日程"],
        "categories": ["室内", "办公环境"]
      },
      "response": {
        "text": "我看到您的办公桌上有一台笔记本电脑和一杯咖啡，还有一份会议日程。需要我帮您整理会议安排或设置提醒吗？",
        "type": "text",
        "actions": [
          {
            "type": "scheduleEvents",
            "label": "整理会议安排",
            "payload": {}
          },
          {
            "type": "searchInfo",
            "label": "查找相关信息",
            "payload": {}
          }
        ]
      },
      "createdAt": "2025-03-27T13:20:00Z"
    },
    "message": "图像识别成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 4.4 获取对话历史

- **端点**: `GET /assistant/conversations/{contextId}`
- **描述**: 获取特定对话上下文的历史消息
- **请求头**: 需要包含有效的 `Authorization` 头
- **URL参数**:
  - `contextId`: 对话上下文ID
  - `limit`: 返回消息数量限制（可选，默认20）
  - `before`: 返回此消息ID之前的消息（可选）
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "contextId": "ctx_123456789",
      "messages": [
        {
          "messageId": "msg_123456789",
          "sender": "user",
          "content": {
            "text": "明天下午3点提醒我参加项目会议",
            "type": "text"
          },
          "createdAt": "2025-03-27T13:20:00Z"
        },
        {
          "messageId": "msg_123456790",
          "sender": "assistant",
          "content": {
            "text": "好的，我已为您设置明天下午3点的项目会议提醒。需要我添加会议地点或其他详情吗？",
            "type": "text",
            "actions": [...]
          },
          "createdAt": "2025-03-27T13:20:05Z"
        }
      ],
      "hasMore": false
    },
    "message": "获取对话历史成功",
    "timestamp": "2025-03-27T13:21:00Z",
    "requestId": "req-123456789"
  }
  ```

### 4.5 自定义AI助手

- **端点**: `PATCH /assistant/preferences`
- **描述**: 更新AI助手的个性化设置
- **请求头**: 需要包含有效的 `Authorization` 头
- **请求体**:
  ```json
  {
    "name": "小艾",
    "avatar": "avatar_3",
    "personality": "friendly",
    "voice": "female_1",
    "responseStyle": "concise",
    "specialties": ["productivity", "creativity"]
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "assistantPreferences": {
        "name": "小艾",
        "avatar": "avatar_3",
        "personality": "friendly",
        "voice": "female_1",
        "responseStyle": "concise",
        "specialties": ["productivity", "creativity"]
      },
      "updatedAt": "2025-03-27T13:20:00Z"
    },
    "message": "AI助手设置更新成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

## 5. 日程管理API

### 5.1 创建任务

- **端点**: `POST /scheduler/tasks`
- **描述**: 创建新任务
- **请求头**: 需要包含有效的 `Authorization` 头
- **请求体**:
  ```json
  {
    "title": "完成项目报告",
    "description": "整理第一季度项目进展并编写总结报告",
    "dueDate": "2025-04-05T18:00:00+08:00",
    "priority": "high",
    "tags": ["工作", "报告"],
    "reminder": {
      "time": "2025-04-05T09:00:00+08:00",
      "type": "notification"
    }
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 201,
    "data": {
      "taskId": "task_123456789",
      "title": "完成项目报告",
      "description": "整理第一季度项目进展并编写总结报告",
      "dueDate": "2025-04-05T18:00:00+08:00",
      "priority": "high",
      "tags": ["工作", "报告"],
      "reminder": {
        "time": "2025-04-05T09:00:00+08:00",
        "type": "notification",
        "status": "scheduled"
      },
      "status": "pending",
      "createdAt": "2025-03-27T13:20:00Z"
    },
    "message": "任务创建成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 5.2 获取任务列表

- **端点**: `GET /scheduler/tasks`
- **描述**: 获取用户的任务列表
- **请求头**: 需要包含有效的 `Authorization` 头
- **URL参数**:
  - `status`: 任务状态筛选（可选，如 `pending`, `completed`）
  - `priority`: 优先级筛选（可选，如 `high`, `medium`, `low`）
  - `tags`: 标签筛选（可选，逗号分隔）
  - `startDate`: 开始日期筛选（可选）
  - `endDate`: 结束日期筛选（可选）
  - `limit`: 返回数量限制（可选，默认20）
  - `offset`: 分页偏移量（可选，默认0）
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "tasks": [
        {
          "taskId": "task_123456789",
          "title": "完成项目报告",
          "description": "整理第一季度项目进展并编写总结报告",
          "dueDate": "2025-04-05T18:00:00+08:00",
          "priority": "high",
          "tags": ["工作", "报告"],
          "status": "pending",
          "createdAt": "2025-03-27T13:20:00Z"
        },
        {
          "taskId": "task_123456790",
          "title": "购买生日礼物",
          "description": "为妈妈挑选生日礼物",
          "dueDate": "2025-04-10T20:00:00+08:00",
          "priority": "medium",
          "tags": ["个人", "购物"],
          "status": "pending",
          "createdAt": "2025-03-26T10:15:00Z"
        }
      ],
      "total": 24,
      "limit": 20,
      "offset": 0
    },
    "message": "获取任务列表成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 5.3 更新任务状态

- **端点**: `PATCH /scheduler/tasks/{taskId}`
- **描述**: 更新任务状态或详情
- **请求头**: 需要包含有效的 `Authorization` 头
- **URL参数**:
  - `taskId`: 任务ID
- **请求体**:
  ```json
  {
    "status": "completed",
    "completedAt": "2025-03-27T13:20:00Z"
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 200,
    "data": {
      "taskId": "task_123456789",
      "status": "completed",
      "completedAt": "2025-03-27T13:20:00Z",
      "updatedAt": "2025-03-27T13:20:00Z"
    },
    "message": "任务状态更新成功",
    "timestamp": "2025-03-27T13:20:00Z",
    "requestId": "req-123456789"
  }
  ```

### 5.4 创建日历事件

- **端点**: `POST /scheduler/events`
- **描述**: 创建新的日历事件
- **请求头**: 需要包含有效的 `Authorization` 头
- **请求体**:
  ```json
  {
    "title": "团队周会",
    "description": "讨论本周工作进展和下周计划",
    "location": "会议室A",
    "startTime": "2025-04-01T10:00:00+08:00",
    "endTime": "2025-04-01T11:30:00+08:00",
    "recurrence": {
      "frequency": "weekly",
      "interval": 1,
      "endDate": "2025-06-30T00:00:00+08:00"
    },
    "attendees": [
      {
        "email": "colleague1@example.com",
        "name": "同事1"
      },
      {
        "email": "colleague2@example.com",
        "name": "同事2"
      }
    ],
    "reminders": [
      {
        "time": -30,
        "unit": "minutes",
        "type": "notification"
      },
      {
        "time": -1,
        "unit": "days",
        "type": "email"
      }
    ]
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "code": 201,
    "data": {
      "eventId": "evt_123456789",
      "title": "团队周会",
      "description": "讨论本周工作进展和下周计划",
      "location": "会议室A",
      "startTime": "2025-04-01T10:00:00+08:00",
      "endTime": "2025-04-01T11:30:00+08:00",
      "recurrence": {
        "frequency": "weekly",
        "interval": 1,
        "endDate": "2025-06-30T00:00:00+08:00"
      },
      "attendees": [
        {
          "email": "colleague1@example.com",
          "name": "同事1",
          <response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>