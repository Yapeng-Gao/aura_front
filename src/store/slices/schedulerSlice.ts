import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 日程状态接口
interface SchedulerState {
  events: Event[];
  tasks: Task[];
  reminders: Reminder[];
  selectedDate: string | null; // ISO格式日期
  selectedEvent: string | null; // 事件ID
  selectedTask: string | null; // 任务ID
  loading: boolean;
  error: string | null;
}

// 事件接口
interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO格式日期时间
  endTime: string; // ISO格式日期时间
  location?: string;
  color?: string;
  isAllDay: boolean;
  recurrence?: RecurrenceRule;
  participants?: Participant[];
  attachments?: Attachment[];
  reminders?: Reminder[];
  createdAt: string;
  updatedAt: string;
}

// 任务接口
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO格式日期
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  tags?: string[];
  reminders?: Reminder[];
  createdAt: string;
  updatedAt: string;
}

// 提醒接口
interface Reminder {
  id: string;
  title: string;
  time: string; // ISO格式日期时间
  type: 'event' | 'task' | 'general';
  referenceId?: string; // 关联的事件或任务ID
  isCompleted: boolean;
  createdAt: string;
}

// 重复规则接口
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string; // ISO格式日期
  endCount?: number;
  weekDays?: number[]; // 0-6, 0表示周日
  monthDays?: number[]; // 1-31
}

// 参与者接口
interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
}

// 附件接口
interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// 初始状态
const initialState: SchedulerState = {
  events: [],
  tasks: [],
  reminders: [],
  selectedDate: new Date().toISOString().split('T')[0],
  selectedEvent: null,
  selectedTask: null,
  loading: false,
  error: null,
};

// 创建日程切片
const schedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    // 加载事件请求
    loadEventsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载事件成功
    loadEventsSuccess: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
      state.loading = false;
    },
    // 加载事件失败
    loadEventsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载任务请求
    loadTasksRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载任务成功
    loadTasksSuccess: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.loading = false;
    },
    // 加载任务失败
    loadTasksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载提醒请求
    loadRemindersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载提醒成功
    loadRemindersSuccess: (state, action: PayloadAction<Reminder[]>) => {
      state.reminders = action.payload;
      state.loading = false;
    },
    // 加载提醒失败
    loadRemindersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 创建事件
    createEvent: (state, action: PayloadAction<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newEvent: Event = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.events.push(newEvent);
    },
    
    // 更新事件
    updateEvent: (state, action: PayloadAction<{ id: string; event: Partial<Event> }>) => {
      const index = state.events.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = {
          ...state.events[index],
          ...action.payload.event,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    // 删除事件
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(e => e.id !== action.payload);
      if (state.selectedEvent === action.payload) {
        state.selectedEvent = null;
      }
    },
    
    // 创建任务
    createTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newTask: Task = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.tasks.push(newTask);
    },
    
    // 更新任务
    updateTask: (state, action: PayloadAction<{ id: string; task: Partial<Task> }>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload.task,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    // 删除任务
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      if (state.selectedTask === action.payload) {
        state.selectedTask = null;
      }
    },
    
    // 创建提醒
    createReminder: (state, action: PayloadAction<Omit<Reminder, 'id' | 'createdAt'>>) => {
      const newReminder: Reminder = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.reminders.push(newReminder);
    },
    
    // 更新提醒
    updateReminder: (state, action: PayloadAction<{ id: string; reminder: Partial<Reminder> }>) => {
      const index = state.reminders.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reminders[index] = {
          ...state.reminders[index],
          ...action.payload.reminder,
        };
      }
    },
    
    // 删除提醒
    deleteReminder: (state, action: PayloadAction<string>) => {
      state.reminders = state.reminders.filter(r => r.id !== action.payload);
    },
    
    // 设置选中日期
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    
    // 设置选中事件
    setSelectedEvent: (state, action: PayloadAction<string | null>) => {
      state.selectedEvent = action.payload;
    },
    
    // 设置选中任务
    setSelectedTask: (state, action: PayloadAction<string | null>) => {
      state.selectedTask = action.payload;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

// 导出动作创建器
export const {
  loadEventsRequest,
  loadEventsSuccess,
  loadEventsFailure,
  loadTasksRequest,
  loadTasksSuccess,
  loadTasksFailure,
  loadRemindersRequest,
  loadRemindersSuccess,
  loadRemindersFailure,
  createEvent,
  updateEvent,
  deleteEvent,
  createTask,
  updateTask,
  deleteTask,
  createReminder,
  updateReminder,
  deleteReminder,
  setSelectedDate,
  setSelectedEvent,
  setSelectedTask,
  clearError,
} = schedulerSlice.actions;

// 导出reducer
export default schedulerSlice.reducer;
