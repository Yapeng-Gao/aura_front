/**
 * 简体中文语言资源
 */
import { LanguageResource } from '../types';

const zh: LanguageResource = {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    yes: '是',
    no: '否',
    back: '返回',
    next: '下一步',
    close: '关闭',
    submit: '提交',
    create: '创建',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    select: '选择',
    clear: '清除',
    refresh: '刷新',
    view: '查看',
    logout: '登出',
    login: '登录',
    register: '注册',
    home: '首页',
    start: '开始',
    finish: '完成',
    resetToDefaults: '恢复默认设置',
    noData: '暂无数据',
    copied: '已复制到剪贴板',
    today: '今天',
    required: '必填',
    retry: '重试',
    seeAll: '查看全部',
    monday: '周一',
    tuesday: '周二',
    wednesday: '周三',
    thursday: '周四',
    friday: '周五',
    saturday: '周六',
    sunday: '周日',
  },
  auth: {
    login: '登录',
    register: '注册',
    forgotPassword: '忘记密码?',
    email: '邮箱',
    password: '密码',
    username: '用户名',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    logout: '退出登录',
    logoutConfirm: '确定要退出登录吗？',
    phone: '手机号',
    rememberMe: '记住我',
    loginSuccessful: '登录成功',
    registerSuccessful: '注册成功',
    invalidCredentials: '用户名或密码错误',
    authError: '认证错误',
    loginRequired: '请先登录',
    logoutSuccessful: '已成功退出登录',
    verificationCode: '验证码',
  },
  profile: {
    title: '个人资料',
    editProfile: '编辑个人资料',
    personalInfo: '个人信息',
    securitySettings: '安全设置',
    notificationSettings: '通知设置',
    darkMode: '深色模式',
    language: '语言',
    privacySettings: '隐私设置',
    helpSupport: '帮助与支持',
    about: '关于',
    uploadAvatar: '上传头像',
    myAchievements: '我的成就',
    unlocked: '已解锁',
    phoneNumber: '手机号码',
    emailCannotEdit: '邮箱地址不能直接修改，请联系客服',
    accountSettings: '账号设置',
    membership: {
      membershipInfo: '会员信息',
      membershipType: '会员类型',
      expiryDate: '到期日期',
      upgradeMembership: '升级会员',
      free: '免费',
      premium: '高级',
      pro: '专业',
      enterprise: '企业',
      notSet: '未设置'
    },
    completion: {
      title: '资料完成度',
      lowProgress: '完善您的个人资料以获得更好的体验',
      midProgress: '即将完成！添加缺失的信息以获得完整体验',
      complete: '太棒了！您的个人资料已完成',
      completeProfile: '完善资料',
      viewProfile: '查看资料',
    },
    camera: '相机',
    gallery: '相册',
    changeAvatar: '更换头像',
    selectSource: '选择图片来源',
    cannotSelectImage: '无法选择图片，请重试',
    avatarUpdateSuccess: '头像更新成功',
    avatarUpdateFailed: '头像更新失败，请重试',
    security: '安全',
    notifications: '通知',
    analytics: '分析',
  },
  settings: {
    title: '设置',
    theme: {
      title: '主题设置',
      light: '浅色',
      dark: '深色',
      system: '系统默认',
    },
    notifications: {
      title: '通知设置',
      pushNotifications: '推送通知',
      emailNotifications: '电子邮件通知',
      marketingEmails: '营销邮件',
      activitySummary: '活动摘要',
    },
    languages: {
      title: '语言设置',
      english: '英语',
      chinese: '简体中文',
      systemDefault: '系统默认',
      changeSuccess: '语言已更改成功',
      helpText: '选择您偏好的语言。应用将重启以应用更改。',
    },
    privacy: {
      title: '隐私设置',
      dataCollection: '数据收集',
      locationServices: '位置服务',
      analytics: '分析与改进',
      dataSharing: '数据共享',
    },
    security: {
      title: '安全设置',
      changePassword: '修改密码',
      twoFactorAuth: '两步验证',
      sessionManagement: '会话管理',
      biometricLogin: '生物识别登录',
    },
    feedback: {
      title: '反馈',
      rateApp: '评价应用',
      sendFeedback: '发送反馈',
      reportIssue: '报告问题',
      suggestFeature: '建议功能',
    },
  },
  achievements: {
    activeUser: '活跃用户',
    contentCreator: '内容创作者',
    earlyAdopter: '早期采用者',
    feedbackProvider: '反馈提供者',
    featureDeveloperTitle: '功能开发中',
    featureDeveloperMessage: '更多成就即将推出！',
    inProgress: '进行中',
  },
  analytics: {
    title: '数据分析',
    dailyActivity: '每日活动',
    weeklyStats: '周统计',
    monthlyReport: '月度报告',
    yearlyOverview: '年度概览',
    usage: '使用情况',
    trends: '趋势',
    overview: '概览',
    details: '详情',
    performance: '性能',
    insights: '洞察',
    noDataAvailable: '所选时间段内无可用数据',
    dateRange: '日期范围',
    custom: '自定义',
    today: '今天',
    yesterday: '昨天',
    thisWeek: '本周',
    lastWeek: '上周',
    thisMonth: '本月',
    lastMonth: '上月',
    thisYear: '今年',
    compare: '比较',
    previousPeriod: '上一时间段',
    featureUsage: '功能使用',
    mostUsed: '最常用',
    leastUsed: '最少用',
    totalTime: '总时长',
    averageTime: '平均时长',
    timeSpentToday: '今日使用时长',
    longestSession: '最长会话',
    usageSummary: '使用摘要',
    trendingFeatures: '热门功能',
    usageTime: '使用时长',
    userProgress: '用户进度',
    total: '总计',
    max: '最大值',
    avg: '平均值',
    mostActiveDay: '最活跃的日期',
    mostUsedFeature: '最常用的功能',
    progressTrend: '进度趋势',
    loadError: '加载错误',
    assistant: '智能助手',
    schedule: '日程',
    notes: '笔记',
    devices: '设备',
    creative: '创意',
    week1: '第1周',
    week2: '第2周',
    week3: '第3周',
    week4: '第4周',
    minutes: '分钟',
    times: '次',
    upward: '上升',
    loadErrorLog: '加载分析数据失败:',
  },
  language: {
    english: '英语',
    chinese: '简体中文',
    spanish: '西班牙语',
    french: '法语',
    german: '德语',
    japanese: '日语',
    korean: '韩语',
    russian: '俄语',
  },
  help: {
    faq: '常见问题',
    deviceConnectionIssues: '设备连接问题',
    accountIssues: '账号相关问题',
    paymentIssues: '支付问题',
    contactSupport: '联系支持',
    onlineSupport: '在线客服',
    phoneSupport: '电话支持',
    emailSupport: '邮件支持',
    other: '其他',
    userAgreement: '用户协议',
    privacyPolicy: '隐私政策',
    feedback: '意见反馈',
    title: '帮助中心',
    contactUs: '联系我们',
    customerService: '客户服务',
  },
  about: {
    version: '版本',
    checkForUpdates: '检查更新',
    checkingForUpdates: '正在检查更新...',
    officialWebsite: '官方网站',
    copyright: '版权信息',
    allRightsReserved: '保留所有权利。',
    appInfo: '应用信息',
    releaseNotes: '版本说明',
    licenses: '许可证',
    termsOfService: '服务条款',
  },
};

export default zh; 