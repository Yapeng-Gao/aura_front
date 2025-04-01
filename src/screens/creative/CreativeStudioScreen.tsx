import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ListItem from '../../components/common/ListItem';
import theme from '../../theme';

// 创意类型定义
interface CreativeProject {
  id: string;
  title: string;
  type: 'text' | 'image' | 'music' | 'video';
  createdAt: string;
  content: string;
  thumbnail?: string;
  tags: string[];
  isFavorite: boolean;
}

const CreativeStudioScreen: React.FC = () => {
  // 创意项目状态
  const [projects, setProjects] = useState<CreativeProject[]>([
    {
      id: '1',
      title: '产品宣传文案',
      type: 'text',
      createdAt: '2025-03-25',
      content: 'Aura智能助手，您的生活管家。融合AI技术，让日常更简单、更高效。无论是日程管理、智能家居控制，还是创意灵感激发，Aura都能满足您的需求。立即体验，开启智能生活新篇章。',
      tags: ['营销', '文案'],
      isFavorite: true,
    },
    {
      id: '2',
      title: '应用界面概念图',
      type: 'image',
      createdAt: '2025-03-26',
      content: '',
      thumbnail: require('../../../assets/images/creative-placeholder.png'),
      tags: ['设计', 'UI'],
      isFavorite: false,
    },
    {
      id: '3',
      title: '产品演示背景音乐',
      type: 'music',
      createdAt: '2025-03-24',
      content: '',
      thumbnail: require('../../../assets/images/music-placeholder.png'),
      tags: ['音乐', '演示'],
      isFavorite: true,
    },
  ]);
  
  // 创意类型
  const [activeCreativeType, setActiveCreativeType] = useState<'text' | 'image' | 'music' | 'video'>('text');
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [prompt, setPrompt] = useState('');
  
  // 保存项目
  const [projectTitle, setProjectTitle] = useState('');
  const [projectTags, setProjectTags] = useState('');
  
  // 处理生成内容
  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // 模拟AI生成过程
    setTimeout(() => {
      let content = '';
      
      switch (activeCreativeType) {
        case 'text':
          content = '基于您的提示，我生成了以下内容：\n\n' +
            '智能生活，从此不同。Aura智能助手将彻底改变您与科技的互动方式。通过先进的AI算法，Aura能够学习您的习惯和偏好，提供真正个性化的体验。\n\n' +
            '无需复杂设置，简单语音指令即可控制家中所有智能设备。日程管理、提醒事项、笔记记录，Aura都能一键完成。更重要的是，Aura还能根据您的兴趣推荐内容，激发创意灵感。\n\n' +
            '选择Aura，选择更智能、更便捷的生活方式。';
          break;
        case 'image':
          content = '图像生成完成。请在右侧预览区查看结果。';
          break;
        case 'music':
          content = '音乐生成完成。请点击播放按钮收听。';
          break;
        case 'video':
          content = '视频生成完成。请点击播放按钮观看。';
          break;
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
    }, 2000);
  };
  
  // 保存生成的内容
  const handleSaveProject = () => {
    if (!projectTitle.trim() || !generatedContent) return;
    
    const newProject: CreativeProject = {
      id: Date.now().toString(),
      title: projectTitle,
      type: activeCreativeType,
      createdAt: new Date().toISOString().split('T')[0],
      content: generatedContent,
      tags: projectTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isFavorite: false,
    };
    
    if (activeCreativeType === 'image') {
      newProject.thumbnail = require('../../../assets/images/creative-placeholder.png');
    } else if (activeCreativeType === 'music') {
      newProject.thumbnail = require('../../../assets/images/music-placeholder.png');
    }
    
    setProjects([newProject, ...projects]);
    
    // 重置表单
    setProjectTitle('');
    setProjectTags('');
    setGeneratedContent('');
    setPrompt('');
  };
  
  // 渲染创意类型选择器
  const renderCreativeTypeSelector = () => {
    const types = [
      { id: 'text', name: '文本', icon: '📝' },
      { id: 'image', name: '图像', icon: '🖼️' },
      { id: 'music', name: '音乐', icon: '🎵' },
      { id: 'video', name: '视频', icon: '🎬' },
    ];
    
    return (
      <View style={styles.typeSelector}>
        {types.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeItem,
              activeCreativeType === type.id && styles.activeTypeItem
            ]}
            onPress={() => setActiveCreativeType(type.id as any)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={[
              styles.typeName,
              activeCreativeType === type.id && styles.activeTypeName
            ]}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // 渲染生成界面
  const renderGenerationInterface = () => {
    return (
      <Card title="AI创意生成" style={styles.generationCard}>
        <View style={styles.promptContainer}>
          <Text style={styles.promptLabel}>创意提示:</Text>
          <TextInput
            style={styles.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder={`输入提示来生成${
              activeCreativeType === 'text' ? '文本' :
              activeCreativeType === 'image' ? '图像' :
              activeCreativeType === 'music' ? '音乐' : '视频'
            }...`}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.promptExamples}>
            <Text style={styles.promptExamplesLabel}>示例提示:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.exampleItem}
                onPress={() => setPrompt(
                  activeCreativeType === 'text' ? '为智能家居产品写一段营销文案，强调便捷和智能' :
                  activeCreativeType === 'image' ? '未来智能家居场景，明亮的客厅，高科技设备，简约风格' :
                  activeCreativeType === 'music' ? '创建一段科技感十足的背景音乐，适合产品演示' :
                  '制作一个15秒的产品介绍视频，展示智能助手的主要功能'
                )}
              >
                <Text style={styles.exampleText}>
                  {activeCreativeType === 'text' ? '营销文案' :
                   activeCreativeType === 'image' ? '智能家居' :
                   activeCreativeType === 'music' ? '科技背景' : '产品介绍'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.exampleItem}
                onPress={() => setPrompt(
                  activeCreativeType === 'text' ? '写一篇关于AI如何改变日常生活的短文' :
                  activeCreativeType === 'image' ? '一个人在使用智能手机控制家中所有设备的场景' :
                  activeCreativeType === 'music' ? '创建一段轻松愉快的音乐，适合应用使用过程' :
                  '制作一个展示日程管理功能的教学视频'
                )}
              >
                <Text style={styles.exampleText}>
                  {activeCreativeType === 'text' ? 'AI与生活' :
                   activeCreativeType === 'image' ? '远程控制' :
                   activeCreativeType === 'music' ? '轻松氛围' : '功能教学'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.exampleItem}
                onPress={() => setPrompt(
                  activeCreativeType === 'text' ? '生成一份智能助手的使用技巧和窍门列表' :
                  activeCreativeType === 'image' ? '设计一个现代简约风格的智能助手应用图标' :
                  activeCreativeType === 'music' ? '创建一段激励人心的音乐，适合启动页面' :
                  '制作一个展示AI助手与用户对话的动画视频'
                )}
              >
                <Text style={styles.exampleText}>
                  {activeCreativeType === 'text' ? '使用技巧' :
                   activeCreativeType === 'image' ? '应用图标' :
                   activeCreativeType === 'music' ? '启动音乐' : 'AI对话'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          <Button
            title={isGenerating ? "生成中..." : "开始生成"}
            variant="primary"
            size="large"
            onPress={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={styles.generateButton}
            fullWidth
          />
        </View>
        
        {generatedContent && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>生成结果:</Text>
            
            {activeCreativeType === 'text' ? (
              <ScrollView style={styles.textResult}>
                <Text style={styles.textResultContent}>{generatedContent}</Text>
              </ScrollView>
            ) : activeCreativeType === 'image' ? (
              <View style={styles.imageResult}>
                <Image
                  source={require('../../../assets/images/creative-placeholder.png')}
                  style={styles.generatedImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.mediaResult}>
                <View style={styles.mediaPlayer}>
                  <Text style={styles.mediaIcon}>
                    {activeCreativeType === 'music' ? '🎵' : '🎬'}
                  </Text>
                  <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playButtonText}>▶️ 播放</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.mediaResultText}>{generatedContent}</Text>
              </View>
            )}
            
            <View style={styles.saveProjectForm}>
              <Text style={styles.saveFormLabel}>保存项目:</Text>
              
              <TextInput
                style={styles.projectTitleInput}
                value={projectTitle}
                onChangeText={setProjectTitle}
                placeholder="项目标题"
              />
              
              <TextInput
                style={styles.projectTagsInput}
                value={projectTags}
                onChangeText={setProjectTags}
                placeholder="标签（用逗号分隔）"
              />
              
              <Button
                title="保存项目"
                variant="outline"
                size="medium"
                onPress={handleSaveProject}
                disabled={!projectTitle.trim()}
                style={styles.saveButton}
                fullWidth
              />
            </View>
          </View>
        )}
      </Card>
    );
  };
  
  // 渲染项目列表
  const renderProjects = () => {
    return (
      <Card title="我的创意项目" style={styles.projectsCard}>
        {projects.length > 0 ? (
          <ScrollView style={styles.projectsList}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectItem}
              >
                <View style={styles.projectHeader}>
                  {project.thumbnail ? (
                    <Image
                      source={project.thumbnail}
                      style={styles.projectThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[
                      styles.projectTypeIcon,
                      project.type === 'text' && styles.textTypeIcon,
                      project.type === 'music' && styles.musicTypeIcon,
                      project.type === 'video' && styles.videoTypeIcon,
                    ]}>
                      <Text style={styles.typeIconText}>
                        {project.type === 'text' ? '📝' :
                         project.type === 'music' ? '🎵' :
                         project.type === 'video' ? '🎬' : ''}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectDate}>{project.createdAt}</Text>
                    
                    <View style={styles.projectTags}>
                      {project.tags.map((tag, index) => (
                        <View key={index} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => {
                      setProjects(projects.map(p => 
                        p.id === project.id ? { ...p, isFavorite: !p.isFavorite } : p
                      ));
                    }}
                  >
                    <Text style={[
                      styles.favoriteIcon,
                      project.isFavorite && styles.activeFavorite
                    ]}>
                      {project.isFavorite ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {project.type === 'text' && project.content && (
                  <Text style={styles.projectContent} numberOfLines={2}>
                    {project.content}
                  </Text>
                )}
                
                <View style={styles.projectActions}>
                  <Button
                    title="编辑"
                    variant="outline"
                    size="small"
                    onPress={() => {}}
                    style={styles.projectAction}
                  />
                  
                  <Button
                    title="分享"
                    variant="outline"
                    size="small"
                    onPress={() => {}}
                    style={styles.projectAction}
                  />
                  
                  <Button
                    title="删除"
                    variant="outline"
                    size="small"
                    onPress={() => {
                      setProjects(projects.filter(p => p.id !== project.id));
                    }}
                    style={[styles.projectAction, styles.deleteButton]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyProjectsText}>
            您还没有创意项目，开始创建吧！
          </Text>
        )}
      </Card>
    );
  };

  return (
    <ScreenContainer
      title="创意工作室"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        {renderCreativeTypeSelector()}
        {renderGenerationInterface()}
        {renderProjects()}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  typeItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  activeTypeItem: {
    backgroundColor: `${theme.colors.primary}20`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  typeName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  activeTypeName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  generationCard: {
    marginBottom: theme.spacing.md,
  },
  promptContainer: {
    marginBottom: theme.spacing.md,
  },
  promptLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  promptInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  promptExamples: {
    marginBottom: theme.spacing.md,
  },
  promptExamplesLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  exampleItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  exampleText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  generateButton: {
    marginTop: theme.spacing.sm,
  },
  resultContainer: {
    marginTop: theme.spacing.md,
  },
  resultLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  textResult: {
    maxHeight: 200,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  textResultContent: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.md,
  },
  imageResult: {
    height: 200,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  mediaResult: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  mediaPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  mediaIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  playButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  playButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.sm,
  },
  mediaResultText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  saveProjectForm: {
    marginTop: theme.spacing.md,
  },
  saveFormLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  projectTitleInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  projectTagsInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    marginTop: theme.spacing.sm,
  },
  projectsCard: {
    marginBottom: theme.spacing.md,
  },
  projectsList: {
    maxHeight: 400,
  },
  projectItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  projectThumbnail: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  projectTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textTypeIcon: {
    backgroundColor: '#E3F2FD',
  },
  musicTypeIcon: {
    backgroundColor: '#F3E5F5',
  },
  videoTypeIcon: {
    backgroundColor: '#E8F5E9',
  },
  typeIconText: {
    fontSize: 24,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  projectDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  projectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  favoriteButton: {
    padding: theme.spacing.sm,
  },
  favoriteIcon: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  activeFavorite: {
    color: theme.colors.warning,
  },
  projectContent: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.lineHeight.md,
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  projectAction: {
    marginLeft: theme.spacing.sm,
  },
  deleteButton: {
    borderColor: theme.colors.error,
  },
  emptyProjectsText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
  },
});

export default CreativeStudioScreen;