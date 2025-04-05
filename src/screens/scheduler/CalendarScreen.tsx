import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Platform } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import theme from '../../theme';
import apiService from '../../services/api';

// 添加事件接口定义
interface Event {
  id: string;
  title: string;
  time: string;
  location: string;
  color: string;
  event_id?: string;
  start_time?: string;
  end_time?: string;
}

// 日历组件
const CalendarScreen: React.FC = () => {
  // 当前日期
  const [currentDate, setCurrentDate] = useState(new Date());
  // 选中的日期
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 添加到组件内部
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchEvents();
  }, [currentDate]);
  
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const response = await apiService.scheduler.getEvents(startDate, endDate);
      if (response) {
        setEvents(response);
      }
    } catch (error) {
      console.error('获取日程失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取月份名称
  const getMonthName = (date: Date) => {
    return date.toLocaleString('zh-CN', { month: 'long' });
  };
  
  // 获取年份
  const getYear = (date: Date) => {
    return date.getFullYear();
  };
  
  // 切换到上个月
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  // 切换到下个月
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // 获取当月的天数
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };
  
  // 获取当月第一天是星期几
  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };
  
  // 检查日期是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // 检查日期是否被选中
  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  // 检查日期是否有事件 - 根据实际事件数据而不是模拟
  const hasEvents = (date: number) => {
    const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    const dateString = fullDate.toISOString().split('T')[0];
    
    return events.some(event => {
      // 处理后端返回的日期格式
      if (event.start_time) {
        const eventDate = new Date(event.start_time).toISOString().split('T')[0];
        return eventDate === dateString;
      }
      // 兼容现有格式
      const [eventHour] = event.time.split(':');
      const eventDate = new Date(fullDate);
      eventDate.setHours(parseInt(eventHour, 10) || 0);
      return eventDate.toISOString().split('T')[0] === dateString;
    });
  };
  
  // 渲染日历
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    
    // 日历头部 - 星期
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 创建日历网格
    const calendarDays = [];
    
    // 添加空白格子（上个月的日期）
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }
    
    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isCurrentDay = isToday(date);
      const isSelectedDay = isSelected(date);
      const dayHasEvents = hasEvents(i);
      
      calendarDays.push(
        <TouchableOpacity
          key={`day-${i}`}
          style={[
            styles.calendarDay,
            isCurrentDay && styles.today,
            isSelectedDay && styles.selectedDay,
          ]}
          onPress={() => {
            setSelectedDate(date);
          }}
        >
          <Text style={[
            styles.calendarDayText,
            isCurrentDay && styles.todayText,
            isSelectedDay && styles.selectedDayText,
          ]}>
            {i}
          </Text>
          {dayHasEvents && <View style={styles.eventDot} />}
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Text style={styles.calendarNavButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {getMonthName(currentDate)} {getYear(currentDate)}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Text style={styles.calendarNavButton}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekdaysContainer}>
          {weekdays.map((day, index) => (
            <Text key={index} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {calendarDays}
        </View>
      </View>
    );
  };
  
  // 渲染事件列表 - 格式化来自API的数据
  const renderEvents = () => {
    return (
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}日程
        </Text>
        
        {events.length > 0 ? (
          events.map((event) => {
            const cardStyle = {
              ...styles.eventCard,
              borderLeftColor: event.color || theme.colors.primary
            };
            
            return (
              <Card 
                key={event.id || event.event_id} 
                style={cardStyle}
              >
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>
                    {event.time || 
                      (event.start_time && event.end_time) 
                        ? `${new Date(event.start_time || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                           ${new Date(event.end_time || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : ''}
                  </Text>
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </Card>
            );
          })
        ) : (
          <Text style={styles.noEventsText}>今天没有日程安排</Text>
        )}
        
        <Button
          title="添加新日程"
          variant="primary"
          size="medium"
          onPress={() => {/* 导航到添加日程页面 */}}
          style={styles.addEventButton}
        />
      </View>
    );
  };

  return (
    <ScreenContainer
      title="日程"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        {renderCalendar()}
        {renderEvents()}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 3
      },
    }),
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  calendarTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 700,
    color: theme.colors.textPrimary,
  },
  calendarNavButton: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary,
    padding: theme.spacing.sm,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  weekdayText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 500,
    color: theme.colors.textSecondary,
    width: 36,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDayText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  today: {
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: 20,
  },
  todayText: {
    fontWeight: 700,
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  selectedDayText: {
    color: theme.colors.onPrimary,
    fontWeight: 700,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    bottom: 6,
  },
  eventsContainer: {
    padding: theme.spacing.md,
  },
  eventsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 700,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  eventCard: {
    marginBottom: theme.spacing.sm,
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 4
  },
  eventContent: {
    padding: theme.spacing.sm,
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 700,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  eventTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventLocation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  noEventsText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
  addEventButton: {
    marginTop: theme.spacing.lg,
    alignSelf: 'center',
  },
});

export default CalendarScreen;
