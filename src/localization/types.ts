/**
 * 语言资源接口定义
 */
export interface LanguageResource {
  common: {
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    loading: string;
    success: string;
    error: string;
    retry: string;
    seeAll: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    back: string;
    next: string;
    close: string;
    submit: string;
    create: string;
    search: string;
    filter: string;
    sort: string;
    select: string;
    clear: string;
    refresh: string;
    view: string;
    logout: string;
    login: string;
    register: string;
    home: string;
    start: string;
    finish: string;
    resetToDefaults: string;
    noData: string;
    copied: string;
    today: string;
    required: string;
    [key: string]: string;
  };
  
  auth: {
    login: string;
    register: string;
    forgotPassword: string;
    email: string;
    password: string;
    username: string;
    loginSuccess: string;
    registerSuccess: string;
    logout: string;
    logoutConfirm: string;
    phone: string;
    rememberMe: string;
    loginSuccessful: string;
    registerSuccessful: string;
    invalidCredentials: string;
    authError: string;
    loginRequired: string;
    logoutSuccessful: string;
    verificationCode: string;
    [key: string]: string;
  };
  
  profile: {
    title: string;
    editProfile: string;
    personalInfo: string;
    securitySettings: string;
    notificationSettings: string;
    darkMode: string;
    language: string;
    privacySettings: string;
    helpSupport: string;
    about: string;
    uploadAvatar: string;
    myAchievements: string;
    unlocked: string;
    phoneNumber: string;
    emailCannotEdit: string;
    accountSettings: string;
    membership: {
      membershipInfo: string;
      membershipType: string;
      expiryDate: string;
      upgradeMembership: string;
      [key: string]: string;
    };
    completion: {
      title: string;
      lowProgress: string;
      midProgress: string;
      complete: string;
      completeProfile: string;
      viewProfile: string;
      [key: string]: string;
    };
    camera: string;
    gallery: string;
    changeAvatar: string;
    selectSource: string;
    cannotSelectImage: string;
    avatarUpdateSuccess: string;
    avatarUpdateFailed: string;
    [key: string]: any;
  };
  
  settings: {
    title: string;
    theme: {
      title: string;
      light: string;
      dark: string;
      system: string;
      [key: string]: string;
    };
    notifications: {
      title: string;
      pushNotifications: string;
      emailNotifications: string;
      marketingEmails: string;
      activitySummary: string;
      [key: string]: string;
    };
    languages: {
      title: string;
      english: string;
      chinese: string;
      systemDefault: string;
      changeSuccess: string;
      helpText: string;
      [key: string]: string;
    };
    privacy: {
      title: string;
      dataCollection: string;
      locationServices: string;
      analytics: string;
      dataSharing: string;
      [key: string]: string;
    };
    security: {
      title: string;
      changePassword: string;
      twoFactorAuth: string;
      sessionManagement: string;
      biometricLogin: string;
      [key: string]: string;
    };
    feedback: {
      title: string;
      rateApp: string;
      sendFeedback: string;
      reportIssue: string;
      suggestFeature: string;
      [key: string]: string;
    };
    [key: string]: any;
  };
  
  achievements: {
    activeUser: string;
    contentCreator: string;
    earlyAdopter: string;
    feedbackProvider: string;
    featureDeveloperTitle: string;
    featureDeveloperMessage: string;
    [key: string]: string;
  };
  
  analytics: {
    title: string;
    dailyActivity: string;
    weeklyStats: string;
    monthlyReport: string;
    yearlyOverview: string;
    usage: string;
    trends: string;
    overview: string;
    details: string;
    performance: string;
    insights: string;
    noDataAvailable: string;
    dateRange: string;
    custom: string;
    today: string;
    yesterday: string;
    thisWeek: string;
    lastWeek: string;
    thisMonth: string;
    lastMonth: string;
    thisYear: string;
    compare: string;
    previousPeriod: string;
    featureUsage: string;
    mostUsed: string;
    leastUsed: string;
    totalTime: string;
    averageTime: string;
    timeSpentToday: string;
    longestSession: string;
    usageSummary: string;
    trendingFeatures: string;
    usageTime: string;
    userProgress: string;
    total: string;
    max: string;
    avg: string;
    mostActiveDay: string;
    mostUsedFeature: string;
    progressTrend: string;
    loadError: string;
    [key: string]: string;
  };
  
  language: {
    english: string;
    chinese: string;
    spanish: string;
    french: string;
    german: string;
    japanese: string;
    korean: string;
    russian: string;
    [key: string]: string;
  };
  
  [key: string]: any;
} 