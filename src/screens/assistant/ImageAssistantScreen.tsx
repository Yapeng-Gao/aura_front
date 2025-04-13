import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 模拟ImagePicker功能
const ImagePicker = {
  requestMediaLibraryPermissionsAsync: async (): Promise<{status: string}> => ({ status: 'granted' }),
  launchImageLibraryAsync: async (options: {
    mediaTypes: string, 
    allowsEditing: boolean, 
    aspect: number[], 
    quality: number
  }): Promise<{
    cancelled: boolean,
    assets: Array<{uri: string}>
  }> => ({
    cancelled: false,
    assets: [{ uri: 'https://picsum.photos/400/400' }]
  })
};

import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import theme from '../../theme';
import apiService from '../../services/api';
import { 
  ImageGenerationRequest, 
  ImageGenerationResponse,
  ImageEditRequest,
  ImageStyleTransferRequest 
} from '../../types/assistant';
import type { ImageStyle as BackendImageStyle } from '../../types/assistant';

// 在React Native中处理图像的自定义类型，适用于文件上传
interface RNImageFile {
  uri: string;
  name: string;
  type: string;
}

// 扩展后端接口类型适应React Native
interface RNImageGenerationRequest extends Omit<ImageGenerationRequest, 'options'> {
  options?: {
    size?: string;
    model?: string;
    quality?: 'standard' | 'hd';
  };
}

interface RNImageEditRequest {
  image: RNImageFile;
  prompt: string;
  mask?: RNImageFile;
  options?: {
    size?: string;
  };
}

interface RNImageStyleTransferRequest {
  image: RNImageFile;
  style: string;
  strength: number;
}

interface LocalImageStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
  preview: any;
  preview_url?: string;
}

interface ImageHistoryItem {
  id: string;
  imageUrl: string;
  prompt?: string;
  style?: string;
  mode: 'text-to-image' | 'image-to-image' | 'edit';
  createdAt: string;
}

// 定义模型和质量选项
interface ModelOption {
  id: string;
  name: string;
  description: string;
}

// 模拟保存到相册功能
const saveToGallery = async (imageUrl: string): Promise<boolean> => {
  try {
    console.log('保存图片到相册:', imageUrl);
    // 在真实实现中，这里需要使用类似expo-media-library的库
    // 模拟成功
    return true;
  } catch (error) {
    console.error('保存到相册失败:', error);
    return false;
  }
};

// 模拟分享功能
const shareImage = async (imageUrl: string): Promise<boolean> => {
  try {
    console.log('分享图片:', imageUrl);
    // 在真实实现中，这里需要使用类似expo-sharing的库
    // 模拟成功
    return true;
  } catch (error) {
    console.error('分享失败:', error);
    return false;
  }
};

interface ImageStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
  preview: any;
}

const INITIAL_STYLES: LocalImageStyle[] = [
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

// 模型选项
const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'wanx2.1-t2i-turbo',
    name: '通义万相',
    description: '阿里云文心大模型，高精度图像生成',
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    description: 'OpenAI最新图像生成模型，高精度、高细节',
  },
  {
    id: 'dall-e-2',
    name: 'DALL-E 2',
    description: 'OpenAI稳定可靠的图像生成模型',
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    description: 'Stability AI的高级模型，细节丰富',
  },
  {
    id: 'stable-diffusion-3',
    name: 'Stable Diffusion 3',
    description: '最新的SD系列模型，支持更好的风格控制',
  },
];

// 质量选项
const QUALITY_OPTIONS = [
  {
    id: 'standard',
    name: '标准',
    description: '适合一般使用，生成速度快',
  },
  {
    id: 'hd',
    name: '高清',
    description: '更高质量，细节更丰富，生成较慢',
  },
];

// 尺寸选项
const SIZE_OPTIONS = [
  {
    id: '512x512',
    name: '小尺寸',
    description: '512x512像素',
  },
  {
    id: '1024x1024',
    name: '标准尺寸',
    description: '1024x1024像素',
  },
  {
    id: '1280x720',
    name: '宽屏',
    description: '1280x720像素',
  },
  {
    id: '720x1280',
    name: '竖屏',
    description: '720x1280像素',
  },
];

const ImageAssistantScreen: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageStyles, setImageStyles] = useState<LocalImageStyle[]>(INITIAL_STYLES);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [mode, setMode] = useState<'text-to-image' | 'image-to-image' | 'edit'>('text-to-image');
  const [isLoadingStyles, setIsLoadingStyles] = useState<boolean>(false);
  const [editType, setEditType] = useState<string>('enhance');
  const [imageHistory, setImageHistory] = useState<ImageHistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
  const [selectedStyleInfo, setSelectedStyleInfo] = useState<LocalImageStyle | null>(null);
  const [isStyleInfoVisible, setIsStyleInfoVisible] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('wanx2.1-t2i-turbo');
  const [selectedQuality, setSelectedQuality] = useState<string>('standard');
  const [selectedSize, setSelectedSize] = useState<string>('1024x1024');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // 风格详情数据
  const styleDetails: Record<string, {
    description: string;
    examples: string[];
    tips: string[];
  }> = {
    'realistic': {
      description: '生成逼真的照片级图像，适合产品展示、场景模拟和写实肖像。',
      examples: [
        '阳光透过树叶照射在森林小径上',
        '一杯热咖啡放在木桌上，旁边有一本打开的书',
        '城市天际线在日落时分的景色'
      ],
      tips: [
        '详细描述光线、材质和环境',
        '提供明确的主体和背景信息',
        '避免使用超现实的元素'
      ]
    },
    'anime': {
      description: '生成日本动漫风格的图像，特点是鲜明的线条和夸张的表情。',
      examples: [
        '在樱花树下的动漫少女角色',
        '具有未来科技感的动漫机器人',
        '日式校园场景的动漫风格插图'
      ],
      tips: [
        '使用动漫特有的术语和元素',
        '描述角色特征，如发型、服装',
        '提及动漫特有的场景或背景'
      ]
    },
    'oil': {
      description: '模拟油画风格，具有明显的笔触、丰富的纹理和色彩层次。',
      examples: [
        '梵高风格的向日葵油画',
        '印象派风格的海边日落',
        '古典油画风格的静物水果篮'
      ],
      tips: [
        '提及特定的油画艺术家或流派',
        '描述期望的笔触和质感',
        '强调色彩和构图的细节'
      ]
    },
    'sketch': {
      description: '生成素描风格的图像，以线条为主，展现出手绘的质感和深度。',
      examples: [
        '建筑物的铅笔素描',
        '人物肖像的炭笔素描',
        '自然风景的速写风格图像'
      ],
      tips: [
        '指定素描工具，如铅笔、炭笔等',
        '描述线条的粗细和深浅',
        '提及阴影和明暗对比'
      ]
    }
  };

  // 获取可用的图像风格
  useEffect(() => {
    async function fetchStyles() {
      try {
        setIsLoadingStyles(true);
        // 尝试从API获取风格列表，如失败则使用初始风格
        try {
          const styles = await apiService.image.getAvailableStyles();
          if (styles && styles.length > 0) {
            const mappedStyles = styles.map(style => ({
              id: style.id,
              name: style.name,
              icon: getIconForStyle(style.id),
              description: style.description,
              preview: { uri: style.preview_url },
              preview_url: style.preview_url
            }));
            setImageStyles(mappedStyles);
          }
        } catch (error) {
          console.warn('无法获取风格列表，使用本地风格', error);
          // 保持初始风格
        }
        
        // 模拟API调用延迟
        setTimeout(() => {
          setIsLoadingStyles(false);
        }, 1000);
      } catch (error) {
        console.error('获取风格失败', error);
        setIsLoadingStyles(false);
      }
    }
    
    fetchStyles();
  }, []);

  // 根据风格ID获取对应的图标
  const getIconForStyle = (styleId: string): string => {
    switch (styleId) {
      case 'realistic': return '🎨';
      case 'anime': return '✨';
      case 'oil': return '🖼️';
      case 'sketch': return '✏️';
      default: return '🎭';
    }
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const pickImage = async () => {
    // 请求相册权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限被拒绝', '需要相册权限来选择图片');
      return;
    }

    // 打开图片选择器
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.cancelled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleGenerate = async () => {
    if (!selectedStyle) {
      Alert.alert('提示', '请选择风格');
      return;
    }

    if (mode === 'text-to-image' && !prompt.trim()) {
      Alert.alert('提示', '请输入描述');
      return;
    }

    if ((mode === 'image-to-image' || mode === 'edit') && !selectedImage) {
      Alert.alert('提示', '请选择图片');
      return;
    }

    setIsGenerating(true);
    
    try {
      let response;
      
      if (mode === 'text-to-image') {
        // 文本生成图像
        // 使用真实的API服务
        const apiRequest: RNImageGenerationRequest = {
          prompt,
          style: selectedStyle,
          options: {
            model: selectedModel,
            quality: selectedQuality === 'standard' ? 'standard' : 'hd',
            size: selectedSize
          }
        };
        
        // 转换到实际的API类型
        const convertedRequest: ImageGenerationRequest = {
          prompt: apiRequest.prompt,
          style: apiRequest.style,
          options: {
            model: apiRequest.options?.model,
            quality: apiRequest.options?.quality,
            size: apiRequest.options?.size
          }
        };
        
        response = await apiService.image.generateImage(convertedRequest);
        
        if (response) {
          setGeneratedImage(response.image_url);
          saveToHistory(response.image_url, mode);
        } else {
          throw new Error('生成图像失败，请重试');
        }
      } else if (mode === 'image-to-image') {
        // 图像+提示生成新图像
        if (!selectedImage) return;
        
        // 创建图像文件对象
        const imageFile: RNImageFile = {
          uri: selectedImage.uri,
          name: 'image.jpg',
          type: 'image/jpeg'
        };
        
        // 使用封装的API调用
        try {
          // 创建FormData
          const formData = new FormData();
          
          // 创建文件对象
          const file = {
            uri: imageFile.uri,
            name: imageFile.name,
            type: imageFile.type
          };
          // @ts-ignore - React Native的FormData处理方式与Web不同
          formData.append('image', file);
          formData.append('style', selectedStyle);
          formData.append('strength', '0.7');
          
          // 直接使用FormData调用API
          const baseUrl = apiService.api.defaults.baseURL || 'http://localhost:8000';
          const result = await fetch(`${baseUrl}/assistant/image/style-transfer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${await AsyncStorage.getItem('aura_auth_token')}`
            },
            body: formData
          });
          
          if (!result.ok) {
            throw new Error(`服务器返回错误: ${result.status}`);
          }
          
          const data = await result.json();
          response = data.data;
          
          if (response) {
            setGeneratedImage(response.image_url);
            saveToHistory(response.image_url, mode);
          } else {
            throw new Error('图像风格转换失败，请重试');
          }
        } catch (error) {
          console.error('风格转换请求失败:', error);
          throw error;
        }
      } else if (mode === 'edit') {
        // 编辑图像
        if (!selectedImage) return;
        
        // 创建图像文件对象
        const imageFile: RNImageFile = {
          uri: selectedImage.uri,
          name: 'image.jpg',
          type: 'image/jpeg'
        };
        
        // 使用封装的API调用
        try {
          // 创建FormData
          const formData = new FormData();
          
          // 创建文件对象
          const file = {
            uri: imageFile.uri,
            name: imageFile.name,
            type: imageFile.type
          };
          // @ts-ignore - React Native的FormData处理方式与Web不同
          formData.append('image', file);
          formData.append('prompt', prompt || '增强图像质量');
          formData.append('edit_type', editType);
          formData.append('size', selectedSize);
          
          // 直接使用FormData调用API
          const baseUrl = apiService.api.defaults.baseURL || 'http://localhost:8000';
          const result = await fetch(`${baseUrl}/assistant/image/edit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${await AsyncStorage.getItem('aura_auth_token')}`
            },
            body: formData
          });
          
          if (!result.ok) {
            throw new Error(`服务器返回错误: ${result.status}`);
          }
          
          const data = await result.json();
          response = data.data;
          
          if (response) {
            setGeneratedImage(response.image_url);
            saveToHistory(response.image_url, mode);
          } else {
            throw new Error('图像编辑失败，请重试');
          }
        } catch (error) {
          console.error('图像编辑请求失败:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('生成图像失败', error);
      Alert.alert('错误', '生成图像失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage) {
      Alert.alert('提示', '没有可保存的图像');
      return;
    }
    
    try {
      const result = await saveToGallery(generatedImage);
      if (result) {
        Alert.alert('成功', '图片已保存到相册');
      } else {
        Alert.alert('失败', '保存图片失败');
      }
    } catch (error) {
      Alert.alert('错误', '保存过程中发生错误');
    }
  };

  const handleShareImage = async () => {
    if (!generatedImage) {
      Alert.alert('提示', '没有可分享的图像');
      return;
    }
    
    try {
      const result = await shareImage(generatedImage);
      if (result) {
        Alert.alert('成功', '图片已分享');
      } else {
        Alert.alert('失败', '分享图片失败');
      }
    } catch (error) {
      Alert.alert('错误', '分享过程中发生错误');
    }
  };

  // 添加保存到历史记录的函数
  const saveToHistory = (imageUrl: string, mode: 'text-to-image' | 'image-to-image' | 'edit') => {
    const newHistoryItem: ImageHistoryItem = {
      id: `history_${Date.now()}`,
      imageUrl,
      prompt: mode === 'text-to-image' || mode === 'edit' ? prompt : undefined,
      style: selectedStyle || undefined,
      mode,
      createdAt: new Date().toISOString()
    };
    
    setImageHistory(prevHistory => [newHistoryItem, ...prevHistory]);
    
    // 在实际应用中，应该将历史记录保存到AsyncStorage或后端
    console.log('保存到历史记录:', newHistoryItem);
  };

  // 显示风格详情
  const showStyleInfo = (styleId: string) => {
    const style = imageStyles.find(s => s.id === styleId);
    if (style) {
      setSelectedStyleInfo(style);
      setIsStyleInfoVisible(true);
    }
  };

  const renderModeSelector = () => (
    <Card title="选择模式" style={styles.card}>
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'text-to-image' && styles.selectedModeButton]}
          onPress={() => setMode('text-to-image')}
        >
          <Text style={styles.modeIcon}>💬</Text>
          <Text style={styles.modeName}>文本生成图像</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'image-to-image' && styles.selectedModeButton]}
          onPress={() => setMode('image-to-image')}
        >
          <Text style={styles.modeIcon}>🔄</Text>
          <Text style={styles.modeName}>图像风格迁移</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'edit' && styles.selectedModeButton]}
          onPress={() => setMode('edit')}
        >
          <Text style={styles.modeIcon}>✏️</Text>
          <Text style={styles.modeName}>图像编辑</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderImageUploader = () => (
    <Card title="上传图片" style={styles.card}>
      {selectedImage ? (
        <View style={styles.selectedImageContainer}>
          <Image 
            source={{ uri: selectedImage.uri }} 
            style={styles.selectedImage} 
            resizeMode="cover"
          />
          <View style={styles.imageActions}>
            <Button
              title="更换图片"
              variant="outline"
              size="small"
              onPress={pickImage}
              style={styles.imageAction}
            />
            <Button
              title="移除图片"
              variant="outline"
              size="small"
              onPress={clearSelectedImage}
              style={styles.imageAction}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadIcon}>📤</Text>
          <Text style={styles.uploadText}>选择图片</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderEditOptions = () => (
    <Card title="编辑选项" style={styles.card}>
      <View style={styles.editOptionsContainer}>
        <TouchableOpacity
          style={[styles.editOption, editType === 'enhance' && styles.selectedEditOption]}
          onPress={() => setEditType('enhance')}
        >
          <Text style={styles.editOptionName}>增强质量</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editOption, editType === 'remove-background' && styles.selectedEditOption]}
          onPress={() => setEditType('remove-background')}
        >
          <Text style={styles.editOptionName}>去除背景</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editOption, editType === 'repair' && styles.selectedEditOption]}
          onPress={() => setEditType('repair')}
        >
          <Text style={styles.editOptionName}>图像修复</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editOption, editType === 'colorize' && styles.selectedEditOption]}
          onPress={() => setEditType('colorize')}
        >
          <Text style={styles.editOptionName}>上色</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editOption, editType === 'adjust' && styles.selectedEditOption]}
          onPress={() => setEditType('adjust')}
        >
          <Text style={styles.editOptionName}>调整</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  // 添加历史记录渲染函数
  const renderHistorySection = () => (
    <Card title="历史记录" style={styles.card}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>最近生成的图像</Text>
        <TouchableOpacity onPress={() => setIsHistoryVisible(!isHistoryVisible)}>
          <Text style={styles.toggleHistoryText}>
            {isHistoryVisible ? '隐藏' : '显示'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isHistoryVisible && (
        <View style={styles.historyList}>
          {imageHistory.length === 0 ? (
            <Text style={styles.emptyHistoryText}>暂无历史记录</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {imageHistory.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.historyItem}
                  onPress={() => {
                    setGeneratedImage(item.imageUrl);
                    if (item.prompt) setPrompt(item.prompt);
                    if (item.style) setSelectedStyle(item.style);
                    setMode(item.mode);
                  }}
                >
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.historyImage} 
                    resizeMode="cover"
                  />
                  <Text style={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </Card>
  );

  // 添加风格详情弹窗渲染函数
  const renderStyleInfoModal = () => (
    <Modal
      visible={isStyleInfoVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsStyleInfoVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedStyleInfo && (
            <>
              <Text style={styles.modalTitle}>{selectedStyleInfo.name}</Text>
              <Text style={styles.modalDescription}>
                {styleDetails[selectedStyleInfo.id]?.description || selectedStyleInfo.description}
              </Text>
              
              <Text style={styles.modalSubtitle}>示例提示词:</Text>
              {styleDetails[selectedStyleInfo.id]?.examples.map((example, index) => (
                <TouchableOpacity 
                  key={`example_${index}`}
                  style={styles.exampleItem}
                  onPress={() => {
                    setPrompt(example);
                    setIsStyleInfoVisible(false);
                  }}
                >
                  <Text style={styles.exampleText}>{example}</Text>
                </TouchableOpacity>
              ))}
              
              <Text style={styles.modalSubtitle}>使用技巧:</Text>
              {styleDetails[selectedStyleInfo.id]?.tips.map((tip, index) => (
                <Text key={`tip_${index}`} style={styles.tipText}>• {tip}</Text>
              ))}
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsStyleInfoVisible(false)}
              >
                <Text style={styles.closeButtonText}>关闭</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // 添加高级选项渲染函数
  const renderAdvancedOptions = () => (
    <Card title="高级选项" style={styles.card}>
      <TouchableOpacity
        style={styles.advancedOptionsToggle}
        onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
      >
        <Text style={styles.advancedOptionsLabel}>
          {showAdvancedOptions ? '隐藏高级选项' : '显示高级选项'}
        </Text>
        <Text style={styles.advancedOptionsIcon}>
          {showAdvancedOptions ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {showAdvancedOptions && (
        <View style={styles.advancedOptionsContent}>
          <Text style={styles.optionSectionTitle}>选择模型:</Text>
          <View style={styles.optionsGrid}>
            {MODEL_OPTIONS.map(model => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.optionItem,
                  selectedModel === model.id && styles.selectedOptionItem
                ]}
                onPress={() => setSelectedModel(model.id)}
              >
                <Text style={styles.optionName}>{model.name}</Text>
                <Text style={styles.optionDescription}>{model.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.optionSectionTitle}>质量设置:</Text>
          <View style={styles.qualityOptions}>
            {QUALITY_OPTIONS.map(quality => (
              <TouchableOpacity
                key={quality.id}
                style={[
                  styles.qualityOption,
                  selectedQuality === quality.id && styles.selectedQualityOption
                ]}
                onPress={() => setSelectedQuality(quality.id)}
              >
                <Text style={styles.optionName}>{quality.name}</Text>
                <Text style={styles.optionDescription}>{quality.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.optionSectionTitle}>图像尺寸:</Text>
          <View style={styles.optionsGrid}>
            {SIZE_OPTIONS.map(size => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.optionItem,
                  selectedSize === size.id && styles.selectedOptionItem
                ]}
                onPress={() => setSelectedSize(size.id)}
              >
                <Text style={styles.optionName}>{size.name}</Text>
                <Text style={styles.optionDescription}>{size.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Card>
  );

  return (
    <ScreenContainer
      title="图像助手"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        {renderModeSelector()}
        
        {/* 文本描述输入 */}
        {(mode === 'text-to-image' || mode === 'edit') && (
          <Card title={mode === 'text-to-image' ? "输入描述" : "编辑提示"} style={styles.card}>
            <TextInput
              style={styles.promptInput}
              placeholder={mode === 'text-to-image' ? "描述你想生成的图像内容..." : "描述如何编辑图像..."}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={3}
            />
          </Card>
        )}
        
        {/* 图片上传 */}
        {(mode === 'image-to-image' || mode === 'edit') && renderImageUploader()}
        
        {/* 编辑选项 */}
        {mode === 'edit' && renderEditOptions()}
        
        {/* 风格选择 */}
        <Card title="选择风格" style={styles.card}>
          {isLoadingStyles ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <View style={styles.styleGrid}>
              {imageStyles.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleItem,
                    selectedStyle === style.id && styles.selectedStyle,
                  ]}
                  onPress={() => handleStyleSelect(style.id)}
                  onLongPress={() => showStyleInfo(style.id)}
                >
                  <Text style={styles.styleIcon}>{style.icon}</Text>
                  <Text style={styles.styleName}>{style.name}</Text>
                  <Text style={styles.styleDescription}>{style.description}</Text>
                  <Image
                    source={style.preview}
                    style={styles.stylePreview}
                    resizeMode="cover"
                  />
                  <Text style={styles.infoHint}>长按查看详情</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Card title="图像生成" style={styles.card}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              (
                !selectedStyle || 
                (mode === 'text-to-image' && !prompt.trim()) || 
                ((mode === 'image-to-image' || mode === 'edit') && !selectedImage) || 
                isGenerating
              ) && styles.disabledButton,
            ]}
            onPress={handleGenerate}
            disabled={
              !selectedStyle || 
              (mode === 'text-to-image' && !prompt.trim()) || 
              ((mode === 'image-to-image' || mode === 'edit') && !selectedImage) || 
              isGenerating
            }
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? '生成中...' : '生成图像'}
            </Text>
            {isGenerating && (
              <ActivityIndicator 
                color={theme.colors.onPrimary} 
                style={styles.loadingIndicator} 
              />
            )}
          </TouchableOpacity>
          
          {generatedImage && !isGenerating && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>生成结果:</Text>
              <Image
                source={{ uri: generatedImage }}
                style={styles.generatedImage}
                resizeMode="contain"
              />
              <View style={styles.actionButtons}>
                <Button
                  title="保存到相册"
                  variant="outline"
                  size="small"
                  onPress={handleSaveToGallery}
                  style={styles.actionButton}
                />
                <Button
                  title="分享"
                  variant="outline"
                  size="small"
                  onPress={handleShareImage}
                  style={styles.actionButton}
                />
              </View>
            </View>
          )}
        </Card>

        {renderHistorySection()}
        {renderStyleInfoModal()}
        {renderAdvancedOptions()}
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
  promptInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    minHeight: 100,
    textAlignVertical: 'top',
    color: theme.colors.textPrimary,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  modeButton: {
    width: '32%',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  selectedModeButton: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  modeName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  uploadText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageAction: {
    marginHorizontal: theme.spacing.xs,
  },
  editOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  editOption: {
    width: '48%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  selectedEditOption: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  editOptionName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.textDisabled,
  },
  generateButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  loadingIndicator: {
    marginLeft: theme.spacing.sm,
  },
  resultContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  generatedImage: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    marginHorizontal: theme.spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  historyTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
  },
  toggleHistoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  historyList: {
    marginTop: theme.spacing.sm,
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
  },
  historyItem: {
    marginRight: theme.spacing.sm,
    width: 120,
  },
  historyImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  historyDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  infoHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  modalSubtitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  exampleItem: {
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  exampleText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  tipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  closeButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  advancedOptionsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  advancedOptionsLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
  },
  advancedOptionsIcon: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
  },
  advancedOptionsContent: {
    marginTop: theme.spacing.md,
  },
  optionSectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  optionItem: {
    width: '48%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  selectedOptionItem: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  optionName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  qualityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  qualityOption: {
    width: '48%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  selectedQualityOption: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
});

export default ImageAssistantScreen; 