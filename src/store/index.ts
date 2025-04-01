import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 导入你的所有 slice reducers
import authReducer from './slices/authSlice';
import assistantReducer from './slices/assistantSlice';
import schedulerReducer from './slices/schedulerSlice';
import productivityReducer from './slices/productivitySlice';
import iotReducer from './slices/iotSlice';
import creativeReducer from './slices/creativeSlice';

// 1. 定义持久化配置 (Persist Config)
const persistConfig = {
  key: 'root', // 存储的 key 前缀
  storage: AsyncStorage, // 使用 AsyncStorage 作为存储引擎
  // whitelist: ['auth', 'settings'], // *选择* 你想要持久化的 slice (推荐使用白名单)
  // blacklist: ['transientSlice'], // 或者选择不想持久化的 slice
  whitelist: ['auth', 'assistant', 'scheduler', 'productivity', 'iot', 'creative'], // 示例：持久化大部分状态，根据需要调整
};

// 2. 组合你的所有 slice reducers
const rootReducer = combineReducers({
  auth: authReducer,
  assistant: assistantReducer,
  scheduler: schedulerReducer,
  productivity: productivityReducer,
  iot: iotReducer,
  creative: creativeReducer,
});

// 3. 创建一个包装了持久化逻辑的 Reducer (Persisted Reducer)
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. 创建 Redux 存储，使用 persistedReducer
const store = configureStore({
  reducer: persistedReducer, // <--- 使用包装后的 Reducer
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // 忽略 redux-persist 的内部 action 类型，这是必须的
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'payload.callback'], // 添加 redux-persist actions
          ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
          ignoredPaths: ['register'], // 如果 register 状态不需要序列化检查
        },
      }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 5. 创建一个 persistor 实例
const persistor = persistStore(store);

// 导出 RootState 和 AppDispatch 类型 (保持不变)
export type RootState = ReturnType<typeof rootReducer>; // 注意：类型从 rootReducer 推断可能更准确
export type AppDispatch = typeof store.dispatch;

// 导出 store 和 persistor
export { store, persistor };
// 不再默认导出 store，而是具名导出
// export default store; // 移除或注释掉这行