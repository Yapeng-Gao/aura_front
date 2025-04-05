import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  useColorScheme
} from 'react-native';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../store/slices/authSlice';
import apiService from '../../services/api';
import theme from '../../theme';

// 注意：这是模拟图片选择器逻辑
// 安装实际的图片选择器后，应当将此注释替换为:
// import * as ImagePicker from 'react-native-image-picker';

interface AvatarUploaderProps {
  currentImageUrl?: string;
  defaultImage: any; // 默认头像资源
  size?: 'small' | 'medium' | 'large';
  onImageUpdated?: (newImageUrl: string) => void;
}

/**
 * 头像上传组件
 */
const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentImageUrl,
  defaultImage,
  size = 'medium',
  onImageUpdated,
}) => {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentImageUrl);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // 当传入的URL变化时更新
  useEffect(() => {
    if (currentImageUrl !== avatarUrl) {
      setAvatarUrl(currentImageUrl);
    }
  }, [currentImageUrl]);
  
  // 成功消息显示后自动清除
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);
  
  // 获取头像尺寸
  const getSize = () => {
    switch (size) {
      case 'small': return 60;
      case 'large': return 120;
      case 'medium':
      default: return 90;
    }
  };
  
  // 处理头像选择和上传
  const handleAvatarUpload = async () => {
    try {
      // 显示选项菜单
      Alert.alert(
        '更换头像',
        '请选择头像图片来源',
        [
          {
            text: '拍照',
            onPress: () => selectAndUploadImage('camera'),
          },
          {
            text: '从相册选择',
            onPress: () => selectAndUploadImage('gallery'),
          },
          {
            text: '取消',
            style: 'cancel',
          },
        ],
      );
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '无法选择图片，请稍后重试');
    }
  };
  
  // 选择并上传图片
  const selectAndUploadImage = async (source: 'camera' | 'gallery') => {
    try {
      setUploading(true);
      
      // 图片选择逻辑 (已实现模拟版本，实际使用时应改为真实调用)
      // 实际实现示例 (取消注释并替换):
      /*
      const options = {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.7,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCamera(options);
      } else {
        result = await ImagePicker.launchImageLibrary(options);
      }

      if (result.didCancel) {
        setUploading(false);
        return;
      }

      if (result.errorCode) {
        throw new Error(result.errorMessage || '选择图片失败');
      }

      const selectedImage = result.assets[0];
      
      // 创建表单数据
      const formData = new FormData();
      formData.append('avatar', {
        uri: selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        name: selectedImage.fileName || 'avatar.jpg',
      });

      // 调用API上传头像
      const response = await apiService.user.uploadAvatar(formData);
      const newImageUrl = response.data.avatar_url;
      */
      
      // 模拟图片选择和上传过程（实际使用时应删除此部分）
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockImageUrl = `https://assets.aura-assistant.com/profiles/user_${Date.now()}.jpg`;
      const newImageUrl = mockImageUrl;
      
      // 更新本地状态
      setAvatarUrl(newImageUrl);
      
      // 更新Redux状态
      dispatch(updateUserProfile({
        profile: {
          avatar: newImageUrl
        }
      }));
      
      // 通知父组件更新成功
      if (onImageUpdated) {
        onImageUpdated(newImageUrl);
      }
      
      // 显示成功状态
      setUploadSuccess(true);
    } catch (error) {
      console.error('上传头像失败:', error);
      Alert.alert('错误', '上传头像失败，请稍后重试');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.container, 
          { width: getSize(), height: getSize() },
          isDarkMode && styles.containerDark
        ]}
        onPress={handleAvatarUpload}
        disabled={uploading}
      >
        <Image
          source={avatarUrl ? { uri: avatarUrl } : defaultImage}
          style={[styles.avatar, { width: getSize(), height: getSize() }]}
        />
        
        {uploading ? (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
          </View>
        ) : (
          <View style={styles.editOverlay}>
            <Text style={styles.editText}>编辑</Text>
          </View>
        )}
        
        {uploadSuccess && (
          <View style={styles.successBadge}>
            <Text style={styles.successText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    position: 'relative',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  containerDark: {
    borderColor: theme.colors.dark.border,
  },
  avatar: {
    borderRadius: 999,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  successBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  successText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AvatarUploader; 