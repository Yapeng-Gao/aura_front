# Aura前端项目结构

```
AuraApp/
├── src/                    # 源代码目录
│   ├── api/                # API服务
│   │   ├── auth.ts         # 认证相关API
│   │   ├── user.ts         # 用户相关API
│   │   ├── assistant.ts    # AI助手相关API
│   │   ├── scheduler.ts    # 日程管理相关API
│   │   ├── productivity.ts # 生产力工具相关API
│   │   ├── iot.ts          # IoT相关API
│   │   └── creative.ts     # 创意服务相关API
│   ├── components/         # 可复用组件
│   │   ├── common/         # 通用组件
│   │   ├── auth/           # 认证相关组件
│   │   ├── assistant/      # AI助手相关组件
│   │   ├── scheduler/      # 日程管理相关组件
│   │   ├── productivity/   # 生产力工具相关组件
│   │   ├── iot/            # IoT相关组件
│   │   └── creative/       # 创意服务相关组件
│   ├── screens/            # 屏幕组件
│   │   ├── auth/           # 认证相关屏幕
│   │   ├── assistant/      # AI助手相关屏幕
│   │   ├── scheduler/      # 日程管理相关屏幕
│   │   ├── productivity/   # 生产力工具相关屏幕
│   │   ├── iot/            # IoT相关屏幕
│   │   ├── creative/       # 创意服务相关屏幕
│   │   └── settings/       # 设置相关屏幕
│   ├── navigation/         # 导航配置
│   │   ├── AppNavigator.tsx    # 主导航器
│   │   ├── AuthNavigator.tsx   # 认证导航器
│   │   ├── TabNavigator.tsx    # 底部标签导航器
│   │   └── types.ts            # 导航类型定义
│   ├── store/              # Redux状态管理
│   │   ├── index.ts        # Store配置
│   │   ├── slices/         # Redux切片
│   │   └── hooks.ts        # 自定义Redux钩子
│   ├── theme/              # 主题配置
│   │   ├── colors.ts       # 颜色定义
│   │   ├── typography.ts   # 排版定义
│   │   └── index.ts        # 主题导出
│   ├── utils/              # 工具函数
│   │   ├── api.ts          # API工具
│   │   ├── storage.ts      # 存储工具
│   │   ├── validation.ts   # 验证工具
│   │   └── formatters.ts   # 格式化工具
│   └── types/              # 类型定义
│       ├── api.ts          # API类型
│       ├── models.ts       # 数据模型类型
│       └── navigation.ts   # 导航类型
├── assets/                 # 静态资源
│   ├── images/             # 图片资源
│   ├── fonts/              # 字体资源
│   └── animations/         # 动画资源
├── .env                    # 环境变量
├── App.tsx                 # 应用入口
└── babel.config.js         # Babel配置
```
