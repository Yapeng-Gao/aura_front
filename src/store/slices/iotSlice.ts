import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// IoT状态接口
interface IoTState {
  devices: Device[];
  deviceTypes: DeviceType[];
  scenes: Scene[];
  selectedDevice: string | null; // 设备ID
  selectedScene: string | null; // 场景ID
  loading: boolean;
  error: string | null;
}

// 设备接口
interface Device {
  id: string;
  name: string;
  type: string; // 设备类型ID
  room: string;
  status: 'online' | 'offline' | 'error';
  state: DeviceState;
  capabilities: string[]; // 设备能力列表
  firmware: string;
  lastUpdated: string;
  createdAt: string;
}

// 设备状态接口
interface DeviceState {
  power?: boolean;
  brightness?: number; // 0-100
  color?: string; // HEX颜色
  temperature?: number; // 温度值
  humidity?: number; // 湿度值
  mode?: string; // 模式
  level?: number; // 水平值
  lock?: boolean; // 锁定状态
  battery?: number; // 电池电量
  [key: string]: any; // 其他可能的状态属性
}

// 设备类型接口
interface DeviceType {
  id: string;
  name: string;
  category: 'lighting' | 'climate' | 'security' | 'entertainment' | 'appliance' | 'sensor' | 'other';
  capabilities: string[]; // 设备类型支持的能力
  icon: string;
  manufacturer?: string;
  model?: string;
}

// 场景接口
interface Scene {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  actions: SceneAction[];
  schedule?: SceneSchedule;
  conditions?: SceneCondition[];
  createdAt: string;
  updatedAt: string;
}

// 场景动作接口
interface SceneAction {
  id: string;
  deviceId: string;
  action: string; // 动作类型
  value: any; // 动作值
  delay?: number; // 延迟执行时间（毫秒）
}

// 场景调度接口
interface SceneSchedule {
  enabled: boolean;
  time?: string; // 24小时制时间，如"18:30"
  days?: number[]; // 0-6，0表示周日
  repeat: boolean;
}

// 场景条件接口
interface SceneCondition {
  id: string;
  type: 'device' | 'time' | 'location' | 'weather';
  deviceId?: string;
  property?: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: any;
}

// 初始状态
const initialState: IoTState = {
  devices: [],
  deviceTypes: [],
  scenes: [],
  selectedDevice: null,
  selectedScene: null,
  loading: false,
  error: null,
};

// 创建IoT切片
const iotSlice = createSlice({
  name: 'iot',
  initialState,
  reducers: {
    // 加载设备请求
    loadDevicesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载设备成功
    loadDevicesSuccess: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
      state.loading = false;
    },
    // 加载设备失败
    loadDevicesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载设备类型请求
    loadDeviceTypesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载设备类型成功
    loadDeviceTypesSuccess: (state, action: PayloadAction<DeviceType[]>) => {
      state.deviceTypes = action.payload;
      state.loading = false;
    },
    // 加载设备类型失败
    loadDeviceTypesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载场景请求
    loadScenesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载场景成功
    loadScenesSuccess: (state, action: PayloadAction<Scene[]>) => {
      state.scenes = action.payload;
      state.loading = false;
    },
    // 加载场景失败
    loadScenesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 添加设备
    addDevice: (state, action: PayloadAction<Omit<Device, 'id' | 'createdAt' | 'lastUpdated'>>) => {
      const now = new Date().toISOString();
      const newDevice: Device = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: now,
        lastUpdated: now,
      };
      state.devices.push(newDevice);
    },
    
    // 更新设备
    updateDevice: (state, action: PayloadAction<{ id: string; device: Partial<Device> }>) => {
      const index = state.devices.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.devices[index] = {
          ...state.devices[index],
          ...action.payload.device,
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    
    // 更新设备状态
    updateDeviceState: (state, action: PayloadAction<{ id: string; state: Partial<DeviceState> }>) => {
      const index = state.devices.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.devices[index].state = {
          ...state.devices[index].state,
          ...action.payload.state,
        };
        state.devices[index].lastUpdated = new Date().toISOString();
      }
    },
    
    // 删除设备
    deleteDevice: (state, action: PayloadAction<string>) => {
      state.devices = state.devices.filter(d => d.id !== action.payload);
      if (state.selectedDevice === action.payload) {
        state.selectedDevice = null;
      }
    },
    
    // 添加设备类型
    addDeviceType: (state, action: PayloadAction<Omit<DeviceType, 'id'>>) => {
      const newDeviceType: DeviceType = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.deviceTypes.push(newDeviceType);
    },
    
    // 更新设备类型
    updateDeviceType: (state, action: PayloadAction<{ id: string; deviceType: Partial<DeviceType> }>) => {
      const index = state.deviceTypes.findIndex(dt => dt.id === action.payload.id);
      if (index !== -1) {
        state.deviceTypes[index] = {
          ...state.deviceTypes[index],
          ...action.payload.deviceType,
        };
      }
    },
    
    // 删除设备类型
    deleteDeviceType: (state, action: PayloadAction<string>) => {
      state.deviceTypes = state.deviceTypes.filter(dt => dt.id !== action.payload);
    },
    
    // 创建场景
    createScene: (state, action: PayloadAction<Omit<Scene, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date().toISOString();
      const newScene: Scene = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      state.scenes.push(newScene);
    },
    
    // 更新场景
    updateScene: (state, action: PayloadAction<{ id: string; scene: Partial<Scene> }>) => {
      const index = state.scenes.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.scenes[index] = {
          ...state.scenes[index],
          ...action.payload.scene,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    // 激活/停用场景
    toggleScene: (state, action: PayloadAction<string>) => {
      const index = state.scenes.findIndex(s => s.id === action.payload);
      if (index !== -1) {
        state.scenes[index].isActive = !state.scenes[index].isActive;
        state.scenes[index].updatedAt = new Date().toISOString();
      }
    },
    
    // 删除场景
    deleteScene: (state, action: PayloadAction<string>) => {
      state.scenes = state.scenes.filter(s => s.id !== action.payload);
      if (state.selectedScene === action.payload) {
        state.selectedScene = null;
      }
    },
    
    // 设置选中设备
    setSelectedDevice: (state, action: PayloadAction<string | null>) => {
      state.selectedDevice = action.payload;
    },
    
    // 设置选中场景
    setSelectedScene: (state, action: PayloadAction<string | null>) => {
      state.selectedScene = action.payload;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

// 导出动作创建器
export const {
  loadDevicesRequest,
  loadDevicesSuccess,
  loadDevicesFailure,
  loadDeviceTypesRequest,
  loadDeviceTypesSuccess,
  loadDeviceTypesFailure,
  loadScenesRequest,
  loadScenesSuccess,
  loadScenesFailure,
  addDevice,
  updateDevice,
  updateDeviceState,
  deleteDevice,
  addDeviceType,
  updateDeviceType,
  deleteDeviceType,
  createScene,
  updateScene,
  toggleScene,
  deleteScene,
  setSelectedDevice,
  setSelectedScene,
  clearError,
} = iotSlice.actions;

// 导出reducer
export default iotSlice.reducer;
