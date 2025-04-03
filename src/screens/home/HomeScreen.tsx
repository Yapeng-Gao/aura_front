import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import ListItem from '../../components/common/ListItem';
import theme from '../../theme';

// 快捷场景类型
interface QuickScene {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 今日日程类型
interface TodaySchedule {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder';
}

const HomeScreen: React.FC = () => {
  // 快捷场景数据
  const quickScenes: QuickScene[] = [
    {
      id: '1',
      name: '回家模式',
      icon: '🏠',
      description: '开启空调、灯光和窗帘',
    },
    {
      id: '2',
      name: '睡眠模式',
      icon: '🌙',
      description: '关闭灯光、开启空调',
    },
    {
      id: '3',
      name: '影院模式',
      icon: '🎬',
      description: '关闭主灯、开启电视',
    },
  ];

  // 今日日程数据
  const todaySchedule: TodaySchedule[] = [
    {
      id: '1',
      title: '产品开发周会',
      time: '10:00',
      type: 'meeting',
    },
    {
      id: '2',
      title: '完成设计文档',
      time: '14:00',
      type: 'task',
    },
    {
      id: '3',
      title: '客户需求讨论',
      time: '16:00',
      type: 'meeting',
    },
  ];

  // 获取日程类型图标
  const getScheduleIcon = (type: 'meeting' | 'task' | 'reminder') => {
    switch (type) {
      case 'meeting':
        return '👥';
      case 'task':
        return '📝';
      case 'reminder':
        return '⏰';
      default:
        return '📌';
    }
  };

  return (
    <ScreenContainer
      title="首页"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        {/* 快捷场景 */}
        <Card title="快捷场景" style={styles.card}>
          <View style={styles.scenesContainer}>
            {quickScenes.map((scene) => (
              <TouchableOpacity
                key={scene.id}
                style={styles.sceneItem}
                onPress={() => {/* 处理场景激活 */}}
              >
                <View style={styles.sceneIcon}>
                  <Text style={styles.sceneIconText}>{scene.icon}</Text>
                </View>
                <Text style={styles.sceneName}>{scene.name}</Text>
                <Text style={styles.sceneDescription}>{scene.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* 今日日程 */}
        <Card title="今日日程" style={styles.card}>
          {todaySchedule.map((schedule) => (
            <ListItem
              key={schedule.id}
              title={schedule.title}
              subtitle={schedule.time}
              leftIcon={<Text style={styles.scheduleIcon}>{getScheduleIcon(schedule.type)}</Text>}
            />
          ))}
        </Card>

        {/* AI助手快捷入口 */}
        <Card title="AI助手" style={styles.card}>
          <TouchableOpacity
            style={styles.assistantButton}
            onPress={() => {/* 导航到AI助手 */}}
          >
            <View style={styles.assistantContent}>
              <Text style={styles.assistantIcon}>🤖</Text>
              <View style={styles.assistantTextContainer}>
                <Text style={styles.assistantTitle}>智能助手</Text>
                <Text style={styles.assistantDescription}>有什么我可以帮您的吗？</Text>
              </View>
            </View>
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
  scenesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
  },
  sceneItem: {
    width: '30%',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  sceneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  sceneIconText: {
    fontSize: 24,
  },
  sceneName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sceneDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  scheduleIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  assistantButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  assistantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assistantIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  assistantTextContainer: {
    flex: 1,
  },
  assistantTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  assistantDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default HomeScreen; 