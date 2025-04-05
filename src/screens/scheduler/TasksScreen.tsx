import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import ListItem from '../../components/common/ListItem';
import theme from '../../theme';
import apiService from '../../services/api';

// 后端任务类型
interface ApiTask {
  task_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
}

// 前端展示用任务类型
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 新任务表单状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  
  // 筛选状态
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  
  // 加载任务
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // 获取任务列表
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await apiService.scheduler.getTasks();
      if (response) {
        // 转换API数据为本地格式
        const displayTasks: Task[] = response.map((apiTask: ApiTask) => ({
          id: apiTask.task_id,
          title: apiTask.title,
          description: apiTask.description,
          dueDate: apiTask.due_date,
          priority: apiTask.priority,
          completed: apiTask.completed,
          category: apiTask.category
        }));
        setTasks(displayTasks);
      }
    } catch (error) {
      console.error('获取任务失败:', error);
      Alert.alert('错误', '获取任务列表失败，请稍后重试');
      // 使用模拟数据
      setTasks([
        { id: '1', title: '完成产品设计文档', description: '包括用户流程和界面原型', dueDate: '2025-03-28', priority: 'high', completed: false, category: '工作' },
        { id: '2', title: '购买生日礼物', description: '为妈妈挑选生日礼物', dueDate: '2025-04-05', priority: 'medium', completed: false, category: '个人' },
        { id: '3', title: '预约牙医', priority: 'low', completed: true, category: '健康' },
        { id: '4', title: '准备团队会议', description: '整理上周进度和本周计划', dueDate: '2025-03-27', priority: 'high', completed: false, category: '工作' },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // 添加新任务
  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      setLoading(true);
      try {
        const newTaskData = {
          title: newTaskTitle,
          description: newTaskDescription || undefined,
          due_date: newTaskDueDate || undefined,
          priority: newTaskPriority,
          category: newTaskCategory || undefined,
        };
        
        const response = await apiService.scheduler.createTask(newTaskData);
        if (response) {
          // 添加新任务到列表
          const newTask: Task = {
            id: response.task_id,
            title: response.title,
            description: response.description,
            dueDate: response.due_date,
            priority: response.priority,
            completed: false,
            category: response.category,
          };
          
          setTasks([...tasks, newTask]);
        }
        
        // 重置表单
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
        setNewTaskPriority('medium');
        setNewTaskCategory('');
        setShowAddForm(false);
      } catch (error) {
        console.error('创建任务失败:', error);
        Alert.alert('错误', '创建任务失败，请稍后重试');
        
        // 本地创建（备用方案）
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
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 切换任务完成状态
  const toggleTaskCompletion = async (id: string) => {
    setLoading(true);
    try {
      const task = tasks.find(task => task.id === id);
      if (!task) return;
      
      const updatedData = {
        completed: !task.completed
      };
      
      const response = await apiService.scheduler.updateTask(id, updatedData);
      if (response) {
        // 更新本地任务
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        ));
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
      Alert.alert('错误', '更新任务状态失败，请稍后重试');
      
      // 本地更新（备用方案）
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    } finally {
      setLoading(false);
    }
  };
  
  // 删除任务
  const deleteTask = async (id: string) => {
    setLoading(true);
    try {
      await apiService.scheduler.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('删除任务失败:', error);
      Alert.alert('错误', '删除任务失败，请稍后重试');
    } finally {
      setLoading(false);
    }
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
  
  // 渲染加载指示器
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  };

  return (
    <ScreenContainer
      title="任务清单"
      backgroundColor={theme.colors.background}
    >
      {renderLoading()}
      
      <View style={styles.header}>
        <Text style={styles.title}>任务清单</Text>
        
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
            <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>待办</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'completed' && styles.activeFilter]} 
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>已完成</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {sortedTasks.length === 0 ? (
          <Card style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'all' ? '没有任务' : filter === 'active' ? '没有待办任务' : '没有已完成任务'}
            </Text>
          </Card>
        ) : (
          sortedTasks.map(task => (
            <Card key={task.id} style={styles.taskCard}>
              <ListItem
                title={task.title}
                subtitle={task.description}
                leftIcon={
                  <TouchableOpacity onPress={() => toggleTaskCompletion(task.id)}>
                    <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                      {task.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                }
                rightIcon={
                  <TouchableOpacity onPress={() => deleteTask(task.id)}>
                    <Text style={styles.deleteButton}>删除</Text>
                  </TouchableOpacity>
                }
                style={task.completed ? styles.completedTask : undefined}
                onPress={() => toggleTaskCompletion(task.id)}
              />
              
              <View style={styles.taskDetails}>
                {task.dueDate && (
                  <View style={styles.taskDetail}>
                    <Text style={styles.taskDetailLabel}>截止日期:</Text>
                    <Text style={styles.taskDetailValue}>{task.dueDate}</Text>
                  </View>
                )}
                
                <View style={styles.taskDetail}>
                  <Text style={styles.taskDetailLabel}>优先级:</Text>
                  <Text style={[styles.taskDetailValue, { color: getPriorityColor(task.priority) }]}>
                    {getPriorityText(task.priority)}
                  </Text>
                </View>
                
                {task.category && (
                  <View style={styles.taskDetail}>
                    <Text style={styles.taskDetailLabel}>分类:</Text>
                    <Text style={styles.taskDetailValue}>{task.category}</Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
      
      <View style={styles.addContainer}>
        {showAddForm ? (
          <Card style={styles.addForm}>
            <Text style={styles.addFormTitle}>新建任务</Text>
            
            <InputField
              label="标题"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="任务标题"
            />
            
            <InputField
              label="描述"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              placeholder="任务描述（可选）"
              multiline
            />
            
            <InputField
              label="截止日期"
              value={newTaskDueDate}
              onChangeText={setNewTaskDueDate}
              placeholder="YYYY-MM-DD（可选）"
            />
            
            <View style={styles.prioritySelector}>
              <Text style={styles.priorityLabel}>优先级:</Text>
              <View style={styles.priorityButtons}>
                <TouchableOpacity
                  style={[styles.priorityButton, newTaskPriority === 'low' && styles.priorityButtonActive]}
                  onPress={() => setNewTaskPriority('low')}
                >
                  <Text style={styles.priorityButtonText}>低</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.priorityButton, newTaskPriority === 'medium' && styles.priorityButtonActive]}
                  onPress={() => setNewTaskPriority('medium')}
                >
                  <Text style={styles.priorityButtonText}>中</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.priorityButton, newTaskPriority === 'high' && styles.priorityButtonActive]}
                  onPress={() => setNewTaskPriority('high')}
                >
                  <Text style={styles.priorityButtonText}>高</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <InputField
              label="分类"
              value={newTaskCategory}
              onChangeText={setNewTaskCategory}
              placeholder="分类（可选）"
            />
            
            <View style={styles.formButtons}>
              <Button
                title="取消"
                onPress={() => {
                  setShowAddForm(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  setNewTaskDueDate('');
                  setNewTaskPriority('medium');
                  setNewTaskCategory('');
                }}
                variant="outline"
                style={styles.formButton}
              />
              
              <Button
                title="添加"
                onPress={handleAddTask}
                disabled={!newTaskTitle.trim()}
                style={styles.formButton}
              />
            </View>
          </Card>
        ) : (
          <Button
            title="添加任务"
            onPress={() => setShowAddForm(true)}
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  activeFilter: {
    backgroundColor: theme.colors.primaryLight,
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  taskCard: {
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
  },
  completedTask: {
    opacity: 0.7,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  taskDetails: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    paddingTop: 0,
  },
  taskDetail: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  taskDetailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginRight: theme.spacing.xs,
  },
  taskDetailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: '400',
  },
  deleteButton: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
  },
  addContainer: {
    padding: theme.spacing.md,
  },
  addForm: {
    padding: theme.spacing.md,
  },
  addFormTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  prioritySelector: {
    marginBottom: theme.spacing.md,
  },
  priorityLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  priorityButtons: {
    flexDirection: 'row',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  priorityButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  formButton: {
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    fontWeight: '500',
  },
});

export default TasksScreen;
