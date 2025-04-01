# Aura智能生活助手App数据模型设计

## 1. 数据模型概述

Aura智能生活助手App的数据模型设计采用混合数据存储策略，结合关系型数据库(PostgreSQL)和非关系型数据库(MongoDB)的优势，以满足不同类型数据的存储需求。关系型数据库主要用于存储结构化数据和需要事务支持的数据，而非关系型数据库则用于存储灵活结构的数据和大规模非结构化数据。

### 1.1 数据存储策略

| 数据类型 | 存储系统 | 选择理由 |
|---------|---------|---------|
| 用户账户数据 | PostgreSQL | 需要强一致性和事务支持 |
| 关系数据(如好友、共享) | PostgreSQL | 需要复杂关系查询 |
| 配置和设置 | PostgreSQL | 结构稳定，需要高可靠性 |
| 订阅和支付记录 | PostgreSQL | 需要ACID事务保证 |
| AI对话历史 | MongoDB | 结构灵活，数据量大 |
| 用户生成内容(笔记、文档) | MongoDB | 半结构化数据，需要灵活模式 |
| AI生成内容 | MongoDB | 非结构化数据，需要高吞吐量 |
| 用户行为数据 | MongoDB | 需要高写入性能，结构可能变化 |

### 1.2 数据分片与分区策略

- **用户数据分片**：基于用户ID哈希进行水平分片
- **时间序列数据分区**：基于时间范围的分区策略(如按月分区)
- **冷热数据分离**：近期活跃数据与历史数据分离存储
- **地理位置分区**：基于用户地理位置的数据本地化存储

### 1.3 数据同步与一致性策略

- **主从复制**：关键数据多副本同步
- **最终一致性模型**：非关键数据采用最终一致性
- **冲突解决策略**：基于时间戳和版本号的冲突检测与解决
- **事务边界**：明确定义需要事务保证的操作边界

## 2. 核心数据实体

### 2.1 用户相关实体

#### 用户(Users)

存储在PostgreSQL中，包含用户的核心账户信息。

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);
```

#### 用户偏好(UserPreferences)

存储在PostgreSQL中，包含用户的应用偏好设置。

```sql
CREATE TABLE user_preferences (
    preference_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'zh-CN',
    theme VARCHAR(20) DEFAULT 'light',
    notification_email BOOLEAN DEFAULT TRUE,
    notification_push BOOLEAN DEFAULT TRUE,
    notification_sound BOOLEAN DEFAULT TRUE,
    notification_vibration BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 用户设备(UserDevices)

存储在PostgreSQL中，记录用户登录的设备信息。

```sql
CREATE TABLE user_devices (
    device_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    push_token VARCHAR(255),
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 用户行为(UserBehaviors)

存储在MongoDB中，记录用户的使用行为和习惯，用于个性化推荐。

```json
{
  "_id": "ObjectId",
  "userId": "UUID",
  "behaviors": [
    {
      "type": "app_open",
      "timestamp": "ISODate",
      "duration": 1200,
      "features_used": ["ai_assistant", "calendar"]
    },
    {
      "type": "feature_use",
      "feature": "ai_assistant",
      "timestamp": "ISODate",
      "duration": 300,
      "details": {
        "query_count": 5,
        "topics": ["weather", "schedule"]
      }
    }
  ],
  "preferences": {
    "frequently_used_features": ["ai_assistant", "calendar", "notes"],
    "active_hours": {
      "morning": 0.3,
      "afternoon": 0.5,
      "evening": 0.2
    },
    "topic_interests": {
      "technology": 0.8,
      "travel": 0.6,
      "finance": 0.4
    }
  },
  "updated_at": "ISODate"
}
```

### 2.2 AI助手相关实体

#### 助手偏好(AssistantPreferences)

存储在PostgreSQL中，记录用户对AI助手的个性化设置。

```sql
CREATE TABLE assistant_preferences (
    preference_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assistant_name VARCHAR(50) DEFAULT '小艾',
    avatar VARCHAR(50) DEFAULT 'default',
    personality VARCHAR(20) DEFAULT 'balanced',
    voice VARCHAR(20) DEFAULT 'female_1',
    response_style VARCHAR(20) DEFAULT 'balanced',
    specialties VARCHAR(255)[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 对话上下文(ConversationContexts)

存储在MongoDB中，记录用户与AI助手的对话上下文。

```json
{
  "_id": "ObjectId",
  "contextId": "ctx_123456789",
  "userId": "UUID",
  "title": "关于周末计划的对话",
  "summary": "讨论了周末出游计划和天气情况",
  "entities": [
    {
      "type": "location",
      "value": "杭州",
      "confidence": 0.95
    },
    {
      "type": "date",
      "value": "2025-03-29",
      "confidence": 0.98
    }
  ],
  "status": "active",
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "last_message_at": "ISODate"
}
```

#### 消息(Messages)

存储在MongoDB中，记录用户与AI助手的对话消息。

```json
{
  "_id": "ObjectId",
  "messageId": "msg_123456789",
  "contextId": "ctx_123456789",
  "userId": "UUID",
  "sender": "user",
  "content": {
    "type": "text",
    "text": "周末杭州天气怎么样？适合出游吗？"
  },
  "metadata": {
    "location": {
      "latitude": 30.2741,
      "longitude": 120.1551
    },
    "device": "iPhone 15 Pro",
    "app_version": "1.2.0"
  },
  "created_at": "ISODate"
}
```

```json
{
  "_id": "ObjectId",
  "messageId": "msg_123456790",
  "contextId": "ctx_123456789",
  "userId": "UUID",
  "sender": "assistant",
  "content": {
    "type": "text",
    "text": "根据天气预报，杭州本周末天气晴好，周六气温20-28℃，周日气温19-26℃，非常适合出游。西湖、灵隐寺等景点可能会比较拥挤，建议提前规划行程。"
  },
  "entities": [
    {
      "type": "weather",
      "location": "杭州",
      "date": "2025-03-29",
      "condition": "晴",
      "temperature": {
        "min": 20,
        "max": 28
      }
    },
    {
      "type": "weather",
      "location": "杭州",
      "date": "2025-03-30",
      "condition": "晴",
      "temperature": {
        "min": 19,
        "max": 26
      }
    },
    {
      "type": "location",
      "name": "西湖",
      "type": "attraction"
    },
    {
      "type": "location",
      "name": "灵隐寺",
      "type": "attraction"
    }
  ],
  "actions": [
    {
      "type": "view_weather",
      "label": "查看详细天气",
      "payload": {
        "location": "杭州",
        "date": "2025-03-29"
      }
    },
    {
      "type": "create_trip",
      "label": "创建出行计划",
      "payload": {
        "destination": "杭州",
        "date": "2025-03-29"
      }
    }
  ],
  "created_at": "ISODate"
}
```

#### 用户查询历史(UserQueries)

存储在MongoDB中，记录用户的查询历史和AI的理解结果。

```json
{
  "_id": "ObjectId",
  "userId": "UUID",
  "queries": [
    {
      "query": "周末杭州天气怎么样？适合出游吗？",
      "timestamp": "ISODate",
      "intent": "weather_inquiry",
      "entities": [
        {
          "type": "location",
          "value": "杭州"
        },
        {
          "type": "time",
          "value": "weekend"
        }
      ],
      "context": "travel_planning"
    }
  ],
  "frequent_intents": [
    {
      "intent": "weather_inquiry",
      "count": 15
    },
    {
      "intent": "schedule_management",
      "count": 12
    }
  ],
  "updated_at": "ISODate"
}
```

### 2.3 日程管理相关实体

#### 日历(Calendars)

存储在PostgreSQL中，记录用户的日历信息。

```sql
CREATE TABLE calendars (
    calendar_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    source VARCHAR(50) DEFAULT 'aura',
    external_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 事件(Events)

存储在PostgreSQL中，记录用户的日历事件。

```sql
CREATE TABLE events (
    event_id UUID PRIMARY KEY,
    calendar_id UUID NOT NULL REFERENCES calendars(calendar_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    recurrence_exception TEXT[],
    status VARCHAR(20) DEFAULT 'confirmed',
    visibility VARCHAR(20) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 任务(Tasks)

存储在PostgreSQL中，记录用户的任务信息。

```sql
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    tags VARCHAR(50)[],
    parent_task_id UUID REFERENCES tasks(task_id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 提醒(Reminders)

存储在PostgreSQL中，记录事件和任务的提醒信息。

```sql
CREATE TABLE reminders (
    reminder_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reference_type VARCHAR(20) NOT NULL, -- 'event' or 'task'
    reference_id UUID NOT NULL,
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'notification', 'email', etc.
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 智能日程建议(ScheduleSuggestions)

存储在MongoDB中，记录AI对用户日程的优化建议。

```json
{
  "_id": "ObjectId",
  "userId": "UUID",
  "date": "2025-03-28",
  "current_schedule": [
    {
      "eventId": "UUID",
      "title": "团队会议",
      "start_time": "2025-03-28T10:00:00Z",
      "end_time": "2025-03-28T11:30:00Z",
      "priority": "high"
    },
    {
      "taskId": "UUID",
      "title": "完成项目报告",
      "due_time": "2025-03-28T18:00:00Z",
      "estimated_duration": 120,
      "priority": "high"
    }
  ],
  "suggestions": [
    {
      "type": "reschedule",
      "item": {
        "taskId": "UUID",
        "title": "完成项目报告"
      },
      "suggested_time": "2025-03-28T14:00:00Z",
      "reason": "根据您的工作效率模式，下午2-4点是您的高效工作时段"
    },
    {
      "type": "break",
      "suggested_time": "2025-03-28T12:00:00Z",
      "duration": 30,
      "reason": "连续工作超过3小时，建议短暂休息"
    }
  ],
  "created_at": "ISODate"
}
```

### 2.4 生产力工具相关实体

#### 笔记(Notes)

存储在MongoDB中，记录用户的笔记内容。

```json
{
  "_id": "ObjectId",
  "noteId": "note_123456789",
  "userId": "UUID",
  "title": "项目构思",
  "content": "# 新产品构思\n\n## 市场需求\n- 目标用户：25-40岁专业人士\n- 痛点：时间管理效率低\n\n## 解决方案\n1. 智能日程规划\n2. 自动化任务优先级",
  "format": "markdown",
  "tags": ["项目", "构思"],
  "folder_id": "folder_123456789",
  "is_pinned": false,
  "is_archived": false,
  "version": 1,
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "last_accessed_at": "ISODate"
}
```

#### 文件夹(Folders)

存储在PostgreSQL中，记录用户的文件夹组织结构。

```sql
CREATE TABLE folders (
    folder_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_folder_id UUID REFERENCES folders(folder_id),
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 文档(Documents)

存储在MongoDB中，记录用户的文档内容和处理结果。

```json
{
  "_id": "ObjectId",
  "documentId": "doc_123456789",
  "userId": "UUID",
  "title": "2025年第一季度财务报告",
  "original_file": {
    "name": "Q1_2025_Financial_Report.pdf",
    "size": 2456789,
    "mime_type": "application/pdf",
    "url": "https://storage.aura-assistant.com/documents/user123/Q1_2025_Financial_Report.pdf"
  },
  "extracted_content": {
    "text": "...(提取的文本内容)...",
    "structure": [
      {
        "type": "heading",
        "level": 1,
        "text": "2025年第一季度财务报告"
      },
      {
        "type": "heading",
        "level": 2,
        "text": "收入概览"
      },
      {
        "type": "paragraph",
        "text": "第一季度总收入达到..."
      },
      {
        "type": "table",
        "caption": "各部门收入明细",
        "data": [...]
      }
    ],
    "metadata": {
      "page_count": 15,
      "author": "财务部",
      "created_date": "2025-03-15"
    }
  },
  "ai_analysis": {
    "summary": "本报告详细分析了2025年第一季度的财务状况，总收入同比增长15%，主要得益于新产品线的成功推出。运营成本控制良好，毛利率提升2个百分点。报告建议增加研发投入，以保持竞争优势。",
    "key_points": [
      "总收入同比增长15%",
      "新产品线贡献30%的增长",
      "毛利率提升2个百分点",
      "建议增加研发投入"
    ],
    "entities": {
      "financial_metrics": [
        {
          "name": "总收入",
          "value": "1.2亿元",
          "change": "+15%"
        },
        {
          "name": "毛利率",
          "value": "42%",
          "change": "+2%"
        }
      ],
      "dates": [
        {
          "text": "2025年第一季度",
          "start_date": "2025-01-01",
          "end_date": "2025-03-31"
        }
      ]
    }
  },
  "tags": ["财务", "报告", "2025", "Q1"],
  "folder_id": "folder_123456789",
  "is_starred": false,
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "last_accessed_at": "ISODate"
}
```

#### 会议(Meetings)

存储在MongoDB中，记录会议内容和转写结果。

```json
{
  "_id": "ObjectId",
  "meetingId": "meeting_123456789",
  "userId": "UUID",
  "title": "产品开发会议",
  "description": "讨论新功能开发计划",
  "date": "2025-03-27T10:00:00Z",
  "duration": 45,
  "participants": [
    {
      "name": "张三",
      "email": "zhangsan@example.com"
    },
    {
      "name": "李四",
      "email": "lisi@example.com"
    }
  ],
  "recording": {
    "url": "https://storage.aura-assistant.com/meetings/user123/meeting_123456789.mp3",
    "duration": 2700,
    "size": 15678900
  },
  "transcript": {
    "language": "zh-CN",
    "segments": [
      {
        "speaker": "张三",
        "start_time": 0.0,
        "end_time": 15.5,
        "text": "今天我们主要讨论新产品功能的开发计划。"
      },
      {
        "speaker": "李四",
        "start_time": 16.2,
        "end_time": 30.8,
        "text": "我认为我们应该优先开发AI助手功能，这是用户最期待的。"
      }
    ]
  },
  "summary": "会议讨论了新产品功能的开发计划。团队同意优先开发AI助手功能，目标是在下个月底前完成第一个版本。讨论了潜在的技术挑战和解决方案。",
  "key_points": [
    "优先开发AI助手功能",
    "目标在4月底前完成第一版",
    "主要技术挑战是性能优化"
  ],
  "action_items": [
    {
      "description": "准备AI助手功能的详细设计文档",
      "assignee": "张三",
      "due_date": "2025-04-03T18:00:00Z"
    },
    {
      "description": "研究性能优化方案",
      "assignee": "李四",
      "due_date": "2025-04-05T18:00:00Z"
    }
  ],
  "tags": ["产品", "开发", "会议"],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 2.5 智能家居相关实体

#### 房间(Rooms)

存储在PostgreSQL中，记录用户的房间信息。

```sql
CREATE TABLE rooms (
    room_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 设备(Devices)

存储在PostgreSQL中，记录用户的智能家居设备信息。

```sql
CREATE TABLE devices (
    device_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(room_id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    capabilities JSONB NOT NULL,
    connection_info JSONB,
    status VARCHAR(20) DEFAULT 'offline',
    last_connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 设备状态(DeviceStates)

存储在MongoDB中，记录设备的实时状态和历史状态。

```json
{
  "_id": "ObjectId",
  "deviceId": "UUID",
  "userId": "UUID",
  "current_state": {
    "power": "on",
    "brightness": 80,
    "color": {
      "r": 255,
      "g": 255,
      "b": 255
    },
    "updated_at": "ISODate"
  },
  "state_history": [
    {
      "timestamp": "ISODate",
      "state": {
        "power": "on",
        "brightness": 60,
        "color": {
          "r": 255,
          "g": 200,
          "b": 100
        }
      },
   <response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>