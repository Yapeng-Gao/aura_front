/**
 * Redux钩子的重导出文件
 * 简化从组件导入Redux钩子的路径
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';

// 使用在整个应用程序中的钩子
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 