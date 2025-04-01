import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import ListItem from '../../components/common/ListItem';
import theme from '../../theme';

// 任务类型定义
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  category?: string;
}

const TasksScreen: React.FC = () => {
  // 任务状态
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: '完成产品设计文档', description: '包括用户流程和界面原型', dueDate: '2025-03-28', priority: 'high', completed: false, category: '工作' },
    { id: '2', title: '购买生日礼物', description: '为妈妈挑选生日礼物', dueDate: '2025-04-05', priority: 'medium', completed: false, category: '个人' },
    { id: '3', title: '预约牙医', priority: 'low', completed: true, category: '健康' },
    { id: '4', title: '准备团队会议', description: '整理上周进度和本周计划', dueDate: '2025-03-27', priority: 'high', completed: false, category: '工作' },
  ]);
  
  // 新任务表单状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  
  // 筛选状态
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  
  // 添加新任务
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        dueDate: newTaskDueDate || undefined,
        priority: newTaskPriority,
        completed: false,
        category: newTaskCategory || undefined,
      };
      
      setTasks([...tasks, newTask]);
      
      // 重置表单
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setNewTaskPriority('medium');
      setNewTaskCategory('');
      setShowAddForm(false);
    }
  };
  
  // 切换任务完成状态
  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // 删除任务
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // 获取优先级颜色
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };
  
  // 获取优先级文本
  const getPriorityText = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '';
    }
  };
  
  // 筛选任务
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  
  // 按优先级和日期排序
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // 首先按完成状态排序
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // 然后按优先级排序
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // 最后按截止日期排序
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    return 0;
  });

  return (
    <ScreenContainer
      title="任务"
      backgroundColor={theme.colors.background}
    >
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>全部</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>进行中</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>已完成</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.tasksContainer}>
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <Card key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <TouchableOpacity
                    style={[styles.checkbox, task.completed && styles.checkboxChecked]}
                    onPress={() => toggleTaskCompletion(task.id)}
                  >
                    {task.completed && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  
                  <View style={styles.taskTitleContainer}>
                    <Text style={[
                      styles.taskTitle,
                      task.completed && styles.completedTaskTitle
                    ]}>
                      {task.title}
                    </Text>
                    
                    {task.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{task.category}</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                      {getPriorityText(task.priority)}
                    </Text>
                  </View>
                </View>
                
                {task.description && (
                  <Text style={[
                    styles.taskDescription,
                    task.completed && styles.completedTaskText
                  ]}>
                    {task.description}
                  </Text>
                )}
                
                <View style={styles.taskFooter}>
                  {task.dueDate && (
                    <Text style={[
                      styles.dueDate,
                      task.completed && styles.completedTaskText
                    ]}>
                      截止日期: {task.dueDate}
                    </Text>
                  )}
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteTask(task.id)}
                  >
                    <Text style={styles.deleteButtonText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          ) : (
            <Text style={styles.noTasksText}>
              {filter === 'all' ? '没有任务' : filter === 'active' ? '没有进行中的任务' : '没有已完成的任务'}
            </Text>
          )}
        </ScrollView>
        
        {showAddForm ? (
          <Card style={styles.addTaskForm}>
            <Text style={styles.formTitle}>添加新任务</Text>
            
            <InputField
              label="标题"
              placeholder="输入任务标题"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />
            
            <InputField
              label="描述"
              placeholder="输入任务描述（可选）"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline
              numberOfLines={3}
            />
            
            <InputField
              label="截止日期"
              placeholder="YYYY-MM-DD"
              value={newTaskDueDate}
              onChangeText={setNewTaskDueDate}
            />
            
            <Text style={styles.formLabel}>优先级</Text>
            <View style={styles.prioritySelector}>
              {(['high', 'medium', 'low'] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    { backgroundColor: getPriorityColor(priority) + '20' },
                    newTaskPriority === priority && { borderColor: getPriorityColor(priority), borderWidth: 2 }
                  ]}
                  onPress={() => setNewTaskPriority(priority)}
                >
                  <Text style={[styles.priorityOptionText, { color: getPriorityColor(priority) }]}>
                    {getPriorityText(priority)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <InputField
              label="分类"
              placeholder="输入任务分类（可选）"
              value={newTaskCategory}
              onChangeText={setNewTaskCategory}
            />
            
            <View style={styles.formButtons}>
              <Button
                title="取消"
                variant="outline"
                size="medium"
                onPress={() => setShowAddForm(false)}
                style={styles.formButton}
              />
              
              <Button
                title="添加"
                variant="primary"
                size="medium"
                onPress={handleAddTask}
                disabled={!newTaskTitle.trim()}
                style={styles.formButton}
              />
            </View>
          </Card>
        ) : (
          <Button
            title="添加任务"
            variant="primary"
            size="large"
            onPress={() => setShowAddForm(true)}
            style={styles.addButton}
            fullWidth
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  activeFilterText: {
    color: theme.colors.onPrimary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  tasksContainer: {
    flex: 1,
    marginBottom: theme.spacing.md,
  },
  taskCard: {
    marginBottom: theme.spacing.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  completedTaskText: {
    color: theme.colors.textSecondary,
  },
  categoryBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  priorityText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  taskDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    paddingLeft: 32, // 对齐标题
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 32, // 对齐标题
  },
  dueDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  deleteButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
  },
  noTasksText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  addButton: {
    marginTop: theme.spacing.md,
  },
  addTaskForm: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  formTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  formLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.xs,
  },
  priorityOptionText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  formButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

export default TasksScreen;
