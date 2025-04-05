import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../theme';
import { SceneResponse } from '../../types/iot';

interface SceneButtonProps {
  scene: SceneResponse;
  onPress: (sceneId: string) => void;
  isExecuting?: boolean;
  isDarkMode?: boolean;
}

const SceneButton: React.FC<SceneButtonProps> = ({
  scene,
  onPress,
  isExecuting = false,
  isDarkMode = false
}) => {
  // 场景图标映射
  const getSceneIcon = () => {
    const defaultIcon = 'flash-outline';
    
    if (scene.icon) return scene.icon;
    
    // 根据场景名称判断
    const sceneName = scene.name.toLowerCase();
    if (sceneName.includes('morning') || sceneName.includes('wake')) return 'sunny-outline';
    if (sceneName.includes('night') || sceneName.includes('sleep')) return 'moon-outline';
    if (sceneName.includes('movie') || sceneName.includes('film')) return 'film-outline';
    if (sceneName.includes('read')) return 'book-outline';
    if (sceneName.includes('away') || sceneName.includes('leave')) return 'exit-outline';
    if (sceneName.includes('home') || sceneName.includes('arrive')) return 'home-outline';
    if (sceneName.includes('party') || sceneName.includes('entertain')) return 'people-outline';
    
    return defaultIcon;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDarkMode && styles.buttonDark
      ]}
      onPress={() => onPress(scene.scene_id)}
      disabled={isExecuting}
    >
      {isExecuting ? (
        <ActivityIndicator 
          size="small" 
          color={isDarkMode ? theme.dark.colors.primary : theme.colors.primary}
        />
      ) : (
        <Icon
          name={getSceneIcon()}
          size={20}
          color={isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary}
        />
      )}
      <Text 
        style={[
          styles.sceneText,
          isDarkMode && styles.sceneTextDark
        ]}
        numberOfLines={1}
      >
        {scene.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.cardBackground,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  buttonDark: {
    backgroundColor: theme.dark.colors.cardBackground,
  },
  sceneText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  sceneTextDark: {
    color: theme.dark.colors.textPrimary,
  },
});

export default SceneButton; 