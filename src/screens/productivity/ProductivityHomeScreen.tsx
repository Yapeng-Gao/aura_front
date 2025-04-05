import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import TabBarIcon from '../../components/common/TabBarIcon';
import theme from '../../theme';

type ProductivityStackParamList = {
  Meeting: undefined;
  Notes: undefined;
  Calendar: undefined;
  Tasks: undefined;
};

type ProductivityNavigationProp = StackNavigationProp<ProductivityStackParamList>;

const ProductivityHomeScreen: React.FC = () => {
  const navigation = useNavigation<ProductivityNavigationProp>();

  const productivityModules = [
    {
      id: 'meeting',
      title: '会议助手',
      description: '管理会议、记录会议内容，自动生成会议纪要',
      icon: 'users',
      color: theme.colors.productivity.primary,
      route: 'Meeting',
    },
    {
      id: 'notes',
      title: '笔记',
      description: '智能笔记，支持图文混排、语音输入和OCR识别',
      icon: 'sticky-note',
      color: '#4CAF50',
      route: 'Notes',
    },
    {
      id: 'calendar',
      title: '日历',
      description: '日程管理，智能提醒，基于自然语言的事件创建',
      icon: 'calendar-alt',
      color: '#2196F3',
      route: 'Calendar',
    },
    {
      id: 'tasks',
      title: '任务清单',
      description: '任务管理，支持优先级排序、截止日期和进度跟踪',
      icon: 'tasks',
      color: '#FF9800',
      route: 'Tasks',
    },
  ];

  const handleModulePress = (route: string) => {
    navigation.navigate(route as any);
  };

  return (
    <ScreenContainer title="效率工具" backgroundColor={theme.colors.background}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.welcomeText}>选择工具，提升效率</Text>
        
        <View style={styles.modulesContainer}>
          {productivityModules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => handleModulePress(module.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: module.color }]}>
                <TabBarIcon name={module.icon} color="#FFFFFF" size={24} />
              </View>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription} numberOfLines={2}>
                {module.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Card title="最近活动" style={styles.recentActivityCard}>
          <Text style={styles.recentActivityItem}>
            • 您有3个任务今天到期
          </Text>
          <Text style={styles.recentActivityItem}>
            • 下次会议：产品开发周会（10:00-11:00）
          </Text>
          <Text style={styles.recentActivityItem}>
            • 新建笔记：项目计划草案
          </Text>
        </Card>
        
        <Card title="效率小贴士" style={styles.tipsCard}>
          <Text style={styles.tipText}>
            使用番茄工作法提高专注力：25分钟专注工作，然后休息5分钟。
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moduleCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  recentActivityCard: {
    marginBottom: 16,
  },
  recentActivityItem: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  tipsCard: {
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default ProductivityHomeScreen; 