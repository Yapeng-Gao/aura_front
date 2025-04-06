import { apiClient } from './api';
import {
  DeviceTypeResponse,
  DeviceResponse,
  DeviceCreate,
  DeviceUpdate,
  DeviceStateResponse,
  DeviceStateUpdate,
  DeviceCommandResponse,
  SceneResponse,
  SceneCreate,
  SceneUpdate,
  SceneExecutionResponse,
  RoomResponse,
  RoomCreate,
  RoomUpdate
} from '../types/iot';

/**
 * IoT服务
 * 处理设备、场景和空间管理等功能
 */
const iotService = {
  // 设备类型管理
  deviceTypes: {
    /**
     * 获取所有设备类型
     */
    getAll: async (): Promise<DeviceTypeResponse[] | null> => {
      try {
        const response = await apiClient.get<DeviceTypeResponse[]>('/iot/device-types');
        return response || null;
      } catch (error) {
        console.error('获取设备类型失败:', error);
        return null;
      }
    },

    /**
     * 获取特定设备类型
     * @param typeId 设备类型ID
     */
    getById: async (typeId: string): Promise<DeviceTypeResponse | null> => {
      try {
        const response = await apiClient.get<DeviceTypeResponse>(`/iot/device-types/${typeId}`);
        return response || null;
      } catch (error) {
        console.error(`获取设备类型(${typeId})失败:`, error);
        return null;
      }
    }
  },

  // 设备管理
  devices: {
    /**
     * 获取所有设备
     */
    getAll: async (): Promise<DeviceResponse[] | null> => {
      try {
        const response = await apiClient.get<DeviceResponse[]>('/iot/devices');
        return response || null;
      } catch (error) {
        console.error('获取设备列表失败:', error);
        return null;
      }
    },

    /**
     * 获取特定设备
     * @param deviceId 设备ID
     */
    getById: async (deviceId: string): Promise<DeviceResponse | null> => {
      try {
        const response = await apiClient.get<DeviceResponse>(`/iot/devices/${deviceId}`);
        return response || null;
      } catch (error) {
        console.error(`获取设备(${deviceId})失败:`, error);
        return null;
      }
    },

    /**
     * 创建设备
     * @param device 设备创建请求
     */
    create: async (device: DeviceCreate): Promise<DeviceResponse | null> => {
      try {
        const response = await apiClient.post<DeviceResponse>('/iot/devices', device);
        return response || null;
      } catch (error) {
        console.error('创建设备失败:', error);
        return null;
      }
    },

    /**
     * 更新设备
     * @param deviceId 设备ID
     * @param update 设备更新请求
     */
    update: async (deviceId: string, update: DeviceUpdate): Promise<DeviceResponse | null> => {
      try {
        const response = await apiClient.put<DeviceResponse>(`/iot/devices/${deviceId}`, update);
        return response || null;
      } catch (error) {
        console.error(`更新设备(${deviceId})失败:`, error);
        return null;
      }
    },

    /**
     * 删除设备
     * @param deviceId 设备ID
     */
    delete: async (deviceId: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/iot/devices/${deviceId}`);
        return true;
      } catch (error) {
        console.error(`删除设备(${deviceId})失败:`, error);
        return false;
      }
    },

    /**
     * 获取设备状态
     * @param deviceId 设备ID
     */
    getState: async (deviceId: string): Promise<DeviceStateResponse | null> => {
      try {
        const response = await apiClient.get<DeviceStateResponse>(`/iot/devices/${deviceId}/state`);
        return response || null;
      } catch (error) {
        console.error(`获取设备状态(${deviceId})失败:`, error);
        return null;
      }
    },

    /**
     * 更新设备状态
     * @param deviceId 设备ID
     * @param state 状态更新请求
     */
    updateState: async (deviceId: string, state: DeviceStateUpdate): Promise<DeviceStateResponse | null> => {
      try {
        const response = await apiClient.put<DeviceStateResponse>(`/iot/devices/${deviceId}/state`, state);
        return response || null;
      } catch (error) {
        console.error(`更新设备状态(${deviceId})失败:`, error);
        return null;
      }
    },

    /**
     * 发送设备命令
     * @param deviceId 设备ID
     * @param command 命令名称
     * @param params 命令参数
     */
    sendCommand: async (
      deviceId: string,
      command: string,
      params?: Record<string, any>
    ): Promise<DeviceCommandResponse | null> => {
      try {
        const response = await apiClient.post<DeviceCommandResponse>(
          `/iot/devices/${deviceId}/commands/${command}`,
          params || {}
        );
        return response || null;
      } catch (error) {
        console.error(`发送设备命令(${deviceId}, ${command})失败:`, error);
        return null;
      }
    }
  },

  // 场景管理
  scenes: {
    /**
     * 获取所有场景
     */
    getAll: async (): Promise<SceneResponse[] | null> => {
      try {
        const response = await apiClient.get<SceneResponse[]>('/iot/scenes');
        return response || null;
      } catch (error) {
        console.error('获取场景列表失败:', error);
        return null;
      }
    },

    /**
     * 获取特定场景
     * @param sceneId 场景ID
     */
    getById: async (sceneId: string): Promise<SceneResponse | null> => {
      try {
        const response = await apiClient.get<SceneResponse>(`/iot/scenes/${sceneId}`);
        return response || null;
      } catch (error) {
        console.error(`获取场景(${sceneId})失败:`, error);
        return null;
      }
    },

    /**
     * 创建场景
     * @param scene 场景创建请求
     */
    create: async (scene: SceneCreate): Promise<SceneResponse | null> => {
      try {
        const response = await apiClient.post<SceneResponse>('/iot/scenes', scene);
        return response || null;
      } catch (error) {
        console.error('创建场景失败:', error);
        return null;
      }
    },

    /**
     * 更新场景
     * @param sceneId 场景ID
     * @param update 场景更新请求
     */
    update: async (sceneId: string, update: SceneUpdate): Promise<SceneResponse | null> => {
      try {
        const response = await apiClient.put<SceneResponse>(`/iot/scenes/${sceneId}`, update);
        return response || null;
      } catch (error) {
        console.error(`更新场景(${sceneId})失败:`, error);
        return null;
      }
    },

    /**
     * 删除场景
     * @param sceneId 场景ID
     */
    delete: async (sceneId: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/iot/scenes/${sceneId}`);
        return true;
      } catch (error) {
        console.error(`删除场景(${sceneId})失败:`, error);
        return false;
      }
    },

    /**
     * 执行场景
     * @param sceneId 场景ID
     */
    execute: async (sceneId: string): Promise<SceneExecutionResponse | null> => {
      try {
        const response = await apiClient.post<SceneExecutionResponse>(`/iot/scenes/${sceneId}/execute`);
        return response || null;
      } catch (error) {
        console.error(`执行场景(${sceneId})失败:`, error);
        return null;
      }
    }
  },

  // 空间管理
  rooms: {
    /**
     * 获取所有空间
     */
    getAll: async (): Promise<RoomResponse[] | null> => {
      try {
        const response = await apiClient.get<RoomResponse[]>('/iot/rooms');
        return response || null;
      } catch (error) {
        console.error('获取空间列表失败:', error);
        return null;
      }
    },

    /**
     * 获取特定空间
     * @param roomId 空间ID
     */
    getById: async (roomId: string): Promise<RoomResponse | null> => {
      try {
        const response = await apiClient.get<RoomResponse>(`/iot/rooms/${roomId}`);
        return response || null;
      } catch (error) {
        console.error(`获取空间(${roomId})失败:`, error);
        return null;
      }
    },

    /**
     * 创建空间
     * @param room 空间创建请求
     */
    create: async (room: RoomCreate): Promise<RoomResponse | null> => {
      try {
        const response = await apiClient.post<RoomResponse>('/iot/rooms', room);
        return response || null;
      } catch (error) {
        console.error('创建空间失败:', error);
        return null;
      }
    },

    /**
     * 更新空间
     * @param roomId 空间ID
     * @param update 空间更新请求
     */
    update: async (roomId: string, update: RoomUpdate): Promise<RoomResponse | null> => {
      try {
        const response = await apiClient.put<RoomResponse>(`/iot/rooms/${roomId}`, update);
        return response || null;
      } catch (error) {
        console.error(`更新空间(${roomId})失败:`, error);
        return null;
      }
    },

    /**
     * 删除空间
     * @param roomId 空间ID
     */
    delete: async (roomId: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/iot/rooms/${roomId}`);
        return true;
      } catch (error) {
        console.error(`删除空间(${roomId})失败:`, error);
        return false;
      }
    },

    /**
     * 获取空间内的设备
     * @param roomId 空间ID
     */
    getDevices: async (roomId: string): Promise<DeviceResponse[] | null> => {
      try {
        const response = await apiClient.get<DeviceResponse[]>(`/iot/rooms/${roomId}/devices`);
        return response || null;
      } catch (error) {
        console.error(`获取空间设备(${roomId})失败:`, error);
        return null;
      }
    }
  }
};

export default iotService; 