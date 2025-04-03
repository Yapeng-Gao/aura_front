import React from 'react';
import { ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface TabBarIconProps {
    name: string;
    color: string;
    size?: number;
    style?: ViewStyle;
}

/**
 * 通用的底部导航栏图标组件
 *
 * @param name - 图标名称（参考FontAwesome图标集）
 * @param color - 图标颜色
 * @param size - 图标大小（默认24）
 * @param style - 额外的样式
 *
 * 使用示例：
 * <TabBarIcon name="home" color="#007AFF" />
 */
const TabBarIcon: React.FC<TabBarIconProps> = ({
                                                   name,
                                                   color,
                                                   size = 24,
                                                   style
                                               }) => {
    return (
        <Icon
            name={name}
            color={color}
            size={size}
            style={style}
        />
    );
};

export default TabBarIcon;