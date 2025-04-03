import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';

const ImageAssistantScreen: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const imageStyles = [
    {
      id: 'realistic',
      name: '写实风格',
      icon: '🎨',
      description: '生成逼真的图像',
      preview: require('../../../assets/images/style-realistic.png'),
    },
    {
      id: 'anime',
      name: '动漫风格',
      icon: '✨',
      description: '生成动漫风格图像',
      preview: require('../../../assets/images/style-anime.png'),
    },
    {
      id: 'oil',
      name: '油画风格',
      icon: '🖼️',
      description: '生成油画风格图像',
      preview: require('../../../assets/images/style-oil.png'),
    },
    {
      id: 'sketch',
      name: '素描风格',
      icon: '✏️',
      description: '生成素描风格图像',
      preview: require('../../../assets/images/style-sketch.png'),
    },
  ];

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleGenerate = () => {
    if (selectedStyle) {
      // TODO: 调用AI生成图像
      console.log('生成图像，风格:', selectedStyle);
    }
  };

  return (
    <ScreenContainer
      title="图像助手"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Card title="选择风格" style={styles.card}>
          <View style={styles.styleGrid}>
            {imageStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleItem,
                  selectedStyle === style.id && styles.selectedStyle,
                ]}
                onPress={() => handleStyleSelect(style.id)}
              >
                <Text style={styles.styleIcon}>{style.icon}</Text>
                <Text style={styles.styleName}>{style.name}</Text>
                <Text style={styles.styleDescription}>{style.description}</Text>
                <Image
                  source={style.preview}
                  style={styles.stylePreview}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card title="图像生成" style={styles.card}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              !selectedStyle && styles.disabledButton,
            ]}
            onPress={handleGenerate}
            disabled={!selectedStyle}
          >
            <Text style={styles.generateButtonText}>生成图像</Text>
          </TouchableOpacity>
        </Card>

        <Card title="图像助手功能" style={styles.card}>
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>图像编辑</Text>
            <Text style={styles.featureDescription}>智能编辑和优化图像</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>风格迁移</Text>
            <Text style={styles.featureDescription}>将图像转换为不同艺术风格</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>图像修复</Text>
            <Text style={styles.featureDescription}>智能修复破损或模糊的图像</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>背景移除</Text>
            <Text style={styles.featureDescription}>自动移除图像背景</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleItem: {
    width: '48%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  selectedStyle: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  styleIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  styleName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  styleDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  stylePreview: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.sm,
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.textDisabled,
  },
  generateButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  assistantFeature: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default ImageAssistantScreen; 