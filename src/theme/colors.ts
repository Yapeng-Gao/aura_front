// 主题颜色定义
export const colors = {
  // 主要颜色
  primary: '#6200EE',      // 主色调 - 深紫色
  primaryLight: '#BB86FC', // 主色调亮色版
  primaryDark: '#3700B3',  // 主色调暗色版
  
  // 次要颜色
  secondary: '#03DAC6',    // 次要色调 - 青绿色
  secondaryLight: '#66FFF8',
  secondaryDark: '#018786',
  
  // 功能色
  error: '#B00020',        // 错误色
  warning: '#FF8800',      // 警告色
  success: '#00C853',      // 成功色
  info: '#2196F3',         // 信息色
  
  // 中性色
  background: '#F5F5F5',   // 背景色
  surface: '#FFFFFF',      // 表面色
  cardBackground: '#FFFFFF', // 卡片背景色
  onPrimary: '#FFFFFF',    // 主色调上的文字颜色
  onSecondary: '#000000',  // 次要色调上的文字颜色
  onBackground: '#000000', // 背景上的文字颜色
  onSurface: '#000000',    // 表面上的文字颜色
  onError: '#FFFFFF',      // 错误色上的文字颜色
  
  // 文字颜色
  textPrimary: '#212121',  // 主要文字颜色
  textSecondary: '#757575', // 次要文字颜色
  textTertiary: '#C5CEE0',  // 第三级文字颜色
  textDisabled: '#9E9E9E', // 禁用状态文字颜色
  
  // 边框和分隔线
  border: '#E0E0E0',       // 边框颜色
  divider: '#EEEEEE',      // 分隔线颜色
  
  // 基础颜色
  white: '#FFFFFF',        // 白色
  black: '#000000',        // 黑色
  
  // 功能模块特定颜色
  assistant: {
    primary: '#6200EE',    // AI助手模块主色调
    bubble: '#E8E8F7',     // 对话气泡背景色
  },
  scheduler: {
    primary: '#0097A7',    // 日程管理模块主色调
    event: '#B2EBF2',      // 事件背景色
    task: '#E0F7FA',       // 任务背景色
  },
  productivity: {
    primary: '#00897B',    // 生产力工具模块主色调
    note: '#E0F2F1',       // 笔记背景色
  },
  iot: {
    primary: '#F57C00',    // IoT模块主色调
    device: '#FFE0B2',     // 设备背景色
    scene: '#FFF3E0',      // 场景背景色
  },
  creative: {
    primary: '#C2185B',    // 创意服务模块主色调
    content: '#FCE4EC',    // 创意内容背景色
  },
  
  // 暗色模式颜色
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    cardBackground: '#1E1E1E', // 卡片背景色
    primary: '#BB86FC',
    secondary: '#03DAC6',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#8897B1',  // 暗色模式第三级文字颜色
    border: '#2C2C2C',
    divider: '#2C2C2C',
    white: '#FFFFFF',        // 暗色模式白色
    black: '#000000',        // 暗色模式黑色
  }
};

export default colors;
