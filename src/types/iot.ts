/**
 * IoT模块类型定义
 */
import { UUID } from "./common";

// 设备类型相关接口
export interface DeviceTypeResponse {
  type_id: string;
  name: string;
  description?: string;
  capabilities: string[];
  properties: Record<string, any>;
  icon?: string;
}

// 设备相关接口
export interface DeviceCreate {
  name: string;
  type_id: string;
  room?: string;
  icon?: string;
  connection_info: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface DeviceUpdate {
  name?: string;
  room?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface DeviceResponse {
  device_id: string;
  name: string;
  type_id: string;
  room?: string;
  icon?: string;
  connection_info: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  state?: DeviceStateResponse;
}

// 设备状态相关接口
export interface DeviceStateUpdate {
  power?: 'on' | 'off';
  brightness?: number;
  color?: string;
  temperature?: number;
  humidity?: number;
  [key: string]: any;
}

export interface DeviceStateResponse {
  device_id: string;
  timestamp: string;
  isOnline: boolean;
  power: 'on' | 'off';
  brightness?: number;
  color?: string;
  temperature?: number;
  humidity?: number;
  [key: string]: any;
}

// 设备命令相关接口
export interface DeviceCommandResponse {
  command_id: string;
  device_id: string;
  command: string;
  parameters: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'success' | 'failed';
  result?: any;
  error?: string;
}

// 场景相关接口
export interface SceneCreate {
  name: string;
  description?: string;
  icon?: string;
  devices: Array<{
    device_id: string;
    actions: Array<{
      property: string;
      value: any;
      delay?: number;
    }>;
  }>;
  schedule?: {
    type: 'once' | 'daily' | 'weekly' | 'custom';
    time?: string;
    days?: number[];
    date?: string;
    cron?: string;
  };
  conditions?: Array<{
    type: 'device' | 'time' | 'location';
    device_id?: string;
    property?: string;
    operator: string;
    value: any;
  }>;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface SceneUpdate {
  name?: string;
  description?: string;
  icon?: string;
  devices?: Array<{
    device_id: string;
    actions: Array<{
      property: string;
      value: any;
      delay?: number;
    }>;
  }>;
  schedule?: {
    type: 'once' | 'daily' | 'weekly' | 'custom';
    time?: string;
    days?: number[];
    date?: string;
    cron?: string;
  } | null;
  conditions?: Array<{
    type: 'device' | 'time' | 'location';
    device_id?: string;
    property?: string;
    operator: string;
    value: any;
  }> | null;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface SceneResponse {
  scene_id: string;
  name: string;
  description?: string;
  icon?: string;
  devices: Array<{
    device_id: string;
    name: string;
    actions: Array<{
      property: string;
      value: any;
      delay?: number;
    }>;
  }>;
  schedule?: {
    type: 'once' | 'daily' | 'weekly' | 'custom';
    time?: string;
    days?: number[];
    date?: string;
    cron?: string;
  };
  conditions?: Array<{
    type: 'device' | 'time' | 'location';
    device_id?: string;
    property?: string;
    operator: string;
    value: any;
  }>;
  is_active: boolean;
  last_executed?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SceneExecutionResponse {
  execution_id: string;
  scene_id: string;
  timestamp: string;
  status: 'pending' | 'success' | 'partial' | 'failed';
  results: Array<{
    device_id: string;
    success: boolean;
    action: string;
    error?: string;
  }>;
}

// 设备搜索相关接口
export interface DeviceSearchQuery {
  query?: string;
  type_id?: string[];
  room?: string[];
  status?: 'online' | 'offline' | 'all';
  capabilities?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DeviceSearchResponse {
  devices: DeviceResponse[];
  total: number;
  limit: number;
  offset: number;
}

// 批量设备更新相关接口
export interface DeviceBatchUpdate {
  device_ids: string[];
  update: DeviceStateUpdate;
}

export interface DeviceBatchResponse {
  success: string[];
  failed: Record<string, string>;
}

// 设备日志相关接口
export interface DeviceLogQuery {
  start_time?: string;
  end_time?: string;
  log_type?: string[];
  limit?: number;
  offset?: number;
}

export interface DeviceLogResponse {
  log_id: string;
  device_id: string;
  timestamp: string;
  log_type: string;
  message: string;
  details?: Record<string, any>;
}

// 设备诊断相关接口
export interface DeviceDiagnosticResponse {
  device_id: string;
  timestamp: string;
  status: 'healthy' | 'warning' | 'error';
  connectivity: {
    status: 'connected' | 'intermittent' | 'disconnected';
    latency?: number;
    signal_strength?: number;
  };
  battery?: {
    level: number;
    charging: boolean;
    estimated_runtime?: number;
  };
  memory?: {
    total: number;
    used: number;
    free: number;
  };
  storage?: {
    total: number;
    used: number;
    free: number;
  };
  issues: Array<{
    code: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    recommendation?: string;
  }>;
}

// 固件更新相关接口
export interface FirmwareUpdateResponse {
  device_id: string;
  current_version: string;
  available_updates: Array<{
    update_id: string;
    version: string;
    release_date: string;
    size: number;
    description: string;
    changes: string[];
    requires_reboot: boolean;
    estimated_time: number;
  }>;
  last_checked: string;
  auto_update: boolean;
  update_status?: {
    status: 'idle' | 'downloading' | 'installing' | 'rebooting' | 'failed';
    progress?: number;
    error?: string;
    started_at?: string;
    completed_at?: string;
  };
}

// 房间相关接口
export interface RoomCreate {
  name: string;
  icon?: string;
  image?: string;
  floor?: number;
  metadata?: Record<string, any>;
}

export interface RoomUpdate {
  name?: string;
  icon?: string;
  image?: string;
  floor?: number;
  metadata?: Record<string, any>;
}

export interface RoomResponse {
  room_id: string;
  name: string;
  icon?: string;
  image?: string | null;
  floor?: number;
  devices_count: number;
  active_devices_count?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RoomStats {
  total_devices: number;
  active_devices: number;
  power_consumption: number;
  device_types: Record<string, number>;
}

// 设备组相关接口
export interface DeviceGroupCreate {
  name: string;
  description?: string;
  icon?: string;
  device_ids?: string[];
  metadata?: Record<string, any>;
}

export interface DeviceGroupUpdate {
  name?: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface DeviceGroupResponse {
  group_id: string;
  name: string;
  description?: string;
  icon?: string;
  device_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DeviceGroupDetailResponse extends DeviceGroupResponse {
  devices: DeviceResponse[];
}

// 设备共享相关接口
export interface DeviceShareCreate {
  email: string;
  permissions: {
    view: boolean;
    control: boolean;
    manage: boolean;
  };
  message?: string;
  expires_at?: string;
}

export interface DeviceSharePermissionsUpdate {
  permissions: {
    view: boolean;
    control: boolean;
    manage: boolean;
  };
  expires_at?: string | null;
}

export interface DeviceSharingResponse {
  share_id: string;
  device_id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  shared_to_id?: string;
  shared_to_email: string;
  shared_to_name?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'revoked';
  permissions: {
    view: boolean;
    control: boolean;
    manage: boolean;
  };
  message?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface SharedDeviceResponse {
  share_id: string;
  device: DeviceResponse;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  permissions: {
    view: boolean;
    control: boolean;
    manage: boolean;
  };
  message?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface MySharedDeviceResponse {
  share_id: string;
  device_id: string;
  device_name: string;
  shared_to_id?: string;
  shared_to_email: string;
  shared_to_name?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'revoked';
  permissions: {
    view: boolean;
    control: boolean;
    manage: boolean;
  };
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

// 设备发现相关接口
export interface DiscoveryParams {
  protocol: string;
  timeout?: number;
  filter?: Record<string, any>;
}

export interface DiscoveredDeviceResponse {
  discovery_id: string;
  protocol: string;
  discovered_at: string;
  device_info: {
    name?: string;
    model?: string;
    manufacturer?: string;
    type?: string;
    address?: string;
    id?: string;
    capabilities?: string[];
    [key: string]: any;
  };
  status: 'new' | 'added' | 'unsupported';
}

export interface DiscoveredDeviceAdd {
  name: string;
  room?: string;
  credentials?: Record<string, any>;
  metadata?: Record<string, any>;
}

// 设备认证相关接口
export interface DeviceAuthRequest {
  auth_type: 'password' | 'token' | 'certificate' | 'oauth';
  credentials: Record<string, any>;
}

export interface DeviceAuthResponse {
  success: boolean;
  auth_token?: string;
  expires_at?: string;
  scopes?: string[];
  error?: string;
}

// 设备令牌相关接口
export interface DeviceTokenRequest {
  name: string;
  scopes: string[];
  expires_in?: number; // 秒
}

export interface DeviceTokenResponse {
  token_id: string;
  token: string;
  name: string;
  scopes: string[];
  created_at: string;
  expires_at?: string;
}

export interface DeviceTokenInfo {
  token_id: string;
  name: string;
  scopes: string[];
  created_at: string;
  expires_at?: string;
  last_used?: string;
}

// 场景模板相关接口
export interface SceneTemplateCreate {
  name: string;
  description?: string;
  category: string;
  icon?: string;
  device_types: string[];
  template: {
    actions: Array<{
      device_type: string;
      property: string;
      value: any;
      delay?: number;
    }>;
    schedule?: {
      type: 'once' | 'daily' | 'weekly' | 'custom';
      time?: string;
      days?: number[];
      cron?: string;
    };
    conditions?: Array<{
      type: 'device' | 'time' | 'location';
      device_type?: string;
      property?: string;
      operator: string;
      value: any;
    }>;
  };
  metadata?: Record<string, any>;
}

export interface SceneTemplateResponse {
  template_id: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  device_types: string[];
  template: {
    actions: Array<{
      device_type: string;
      property: string;
      value: any;
      delay?: number;
    }>;
    schedule?: {
      type: 'once' | 'daily' | 'weekly' | 'custom';
      time?: string;
      days?: number[];
      cron?: string;
    };
    conditions?: Array<{
      type: 'device' | 'time' | 'location';
      device_type?: string;
      property?: string;
      operator: string;
      value: any;
    }>;
  };
  popularity: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 设备使用统计相关接口
export interface DeviceUsageStats {
  device_id: string;
  total_runtime: number; // 秒
  power_consumption: number; // 瓦时
  on_count: number;
  average_daily_usage: number; // 秒
  usage_by_hour: Record<string, number>;
  usage_by_day: Record<string, number>;
  state_changes: number;
  command_count: number;
  most_used_commands: Record<string, number>;
  peak_usage_time: string;
}

// 系统统计相关接口
export interface SystemStats {
  total_devices: number;
  online_devices: number;
  total_rooms: number;
  total_scenes: number;
  device_types: Record<string, number>;
  active_schedules: number;
  total_users: number;
  total_shares: number;
  system_uptime: number; // 秒
  average_response_time: number; // 毫秒
  memory_usage: number; // 百分比
  cpu_usage: number; // 百分比
  storage_usage: number; // 百分比
  daily_commands: number;
  monthly_commands: number;
}

// 系统配置相关接口
export interface SystemConfigUpdate {
  value: any;
  description?: string;
} 