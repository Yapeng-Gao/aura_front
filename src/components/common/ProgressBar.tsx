import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import theme from '../../theme';

interface ProgressBarProps {
  progress: number; // 0 到 1 之间的值
  color?: string;
  height?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = theme.colors.primary,
  height = 4,
  backgroundColor = theme.colors.border,
  style,
}) => {
  // 确保进度在 0-1 之间
  const validProgress = Math.min(Math.max(progress, 0), 1);
  
  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <View 
        style={[
          styles.progress, 
          { 
            width: `${validProgress * 100}%`,
            backgroundColor: color,
            height
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progress: {
    borderRadius: 2,
  },
});

export default ProgressBar; 