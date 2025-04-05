import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Card from '../common/Card';
import theme from '../../theme';
import { RootStackParamList } from '../../navigation/types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ProfileCompletionCardProps {
  user: {
    username?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string;
  };
}

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ user }) => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  // 计算资料完成度
  const calculateCompletion = () => {
    let total = 0;
    let completed = 0;
    
    // 检查必填字段
    if (user.username) completed++;
    if (user.email) completed++;
    total += 2;
    
    // 检查选填字段
    if (user.phoneNumber) completed++;
    if (user.profileImage) completed++;
    total += 2;
    
    const percentage = Math.floor((completed / total) * 100);
    return {
      percentage,
      completed,
      total
    };
  };
  
  const completion = calculateCompletion();
  
  // 获取提示信息
  const getPromptMessage = () => {
    if (completion.percentage < 50) {
      return '完善您的个人资料，获得更好的体验';
    } else if (completion.percentage < 100) {
      return '即将完成！添加缺失的信息获得完整体验';
    } else {
      return '太好了！您的个人资料已经完善';
    }
  };
  
  // 获取进度条颜色
  const getProgressColor = () => {
    if (completion.percentage < 50) {
      return theme.colors.warning;
    } else if (completion.percentage < 100) {
      return theme.colors.info;
    } else {
      return theme.colors.success;
    }
  };
  
  return (
    <Card title="个人资料完成度" style={styles.card}>
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.percentageText}>{completion.percentage}%</Text>
          <Text style={styles.promptText}>{getPromptMessage()}</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${completion.percentage}%`,
                backgroundColor: getProgressColor()
              }
            ]} 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.completeButtonText}>
            {completion.percentage === 100 ? '查看资料' : '完善资料'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  container: {
    padding: theme.spacing.md,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  percentageText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  promptText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  completeButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  completeButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold',
  }
});

export default ProfileCompletionCard; 