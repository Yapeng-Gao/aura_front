import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 生产力工具状态接口
interface ProductivityState {
  notes: Note[];
  documents: Document[];
  meetings: Meeting[];
  selectedNote: string | null; // 笔记ID
  selectedDocument: string | null; // 文档ID
  selectedMeeting: string | null; // 会议ID
  loading: boolean;
  error: string | null;
}

// 笔记接口
interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  color?: string;
  isPinned: boolean;
  lastEditedAt: string;
  createdAt: string;
}

// 文档接口
interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'txt' | 'other';
  url: string;
  size: number;
  summary?: string;
  tags?: string[];
  lastAccessedAt: string;
  createdAt: string;
}

// 会议接口
interface Meeting {
  id: string;
  title: string;
  startTime: string; // ISO格式日期时间
  endTime: string; // ISO格式日期时间
  participants: Participant[];
  agenda?: string;
  notes?: string;
  recordingUrl?: string;
  transcription?: string;
  summary?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

// 参与者接口
interface Participant {
  id: string;
  name: string;
  email: string;
  role?: string;
}

// 初始状态
const initialState: ProductivityState = {
  notes: [],
  documents: [],
  meetings: [],
  selectedNote: null,
  selectedDocument: null,
  selectedMeeting: null,
  loading: false,
  error: null,
};

// 创建生产力工具切片
const productivitySlice = createSlice({
  name: 'productivity',
  initialState,
  reducers: {
    // 加载笔记请求
    loadNotesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载笔记成功
    loadNotesSuccess: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
      state.loading = false;
    },
    // 加载笔记失败
    loadNotesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载文档请求
    loadDocumentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载文档成功
    loadDocumentsSuccess: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload;
      state.loading = false;
    },
    // 加载文档失败
    loadDocumentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载会议请求
    loadMeetingsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载会议成功
    loadMeetingsSuccess: (state, action: PayloadAction<Meeting[]>) => {
      state.meetings = action.payload;
      state.loading = false;
    },
    // 加载会议失败
    loadMeetingsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 创建笔记
    createNote: (state, action: PayloadAction<Omit<Note, 'id' | 'createdAt' | 'lastEditedAt'>>) => {
      const now = new Date().toISOString();
      const newNote: Note = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: now,
        lastEditedAt: now,
      };
      state.notes.push(newNote);
    },
    
    // 更新笔记
    updateNote: (state, action: PayloadAction<{ id: string; note: Partial<Note> }>) => {
      const index = state.notes.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          ...action.payload.note,
          lastEditedAt: new Date().toISOString(),
        };
      }
    },
    
    // 删除笔记
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(n => n.id !== action.payload);
      if (state.selectedNote === action.payload) {
        state.selectedNote = null;
      }
    },
    
    // 上传文档
    uploadDocument: (state, action: PayloadAction<Omit<Document, 'id' | 'createdAt' | 'lastAccessedAt'>>) => {
      const now = new Date().toISOString();
      const newDocument: Document = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: now,
        lastAccessedAt: now,
      };
      state.documents.push(newDocument);
    },
    
    // 更新文档
    updateDocument: (state, action: PayloadAction<{ id: string; document: Partial<Document> }>) => {
      const index = state.documents.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = {
          ...state.documents[index],
          ...action.payload.document,
        };
      }
    },
    
    // 访问文档
    accessDocument: (state, action: PayloadAction<string>) => {
      const index = state.documents.findIndex(d => d.id === action.payload);
      if (index !== -1) {
        state.documents[index].lastAccessedAt = new Date().toISOString();
      }
    },
    
    // 删除文档
    deleteDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(d => d.id !== action.payload);
      if (state.selectedDocument === action.payload) {
        state.selectedDocument = null;
      }
    },
    
    // 创建会议
    createMeeting: (state, action: PayloadAction<Omit<Meeting, 'id' | 'createdAt'>>) => {
      const newMeeting: Meeting = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.meetings.push(newMeeting);
    },
    
    // 更新会议
    updateMeeting: (state, action: PayloadAction<{ id: string; meeting: Partial<Meeting> }>) => {
      const index = state.meetings.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.meetings[index] = {
          ...state.meetings[index],
          ...action.payload.meeting,
        };
      }
    },
    
    // 删除会议
    deleteMeeting: (state, action: PayloadAction<string>) => {
      state.meetings = state.meetings.filter(m => m.id !== action.payload);
      if (state.selectedMeeting === action.payload) {
        state.selectedMeeting = null;
      }
    },
    
    // 设置选中笔记
    setSelectedNote: (state, action: PayloadAction<string | null>) => {
      state.selectedNote = action.payload;
    },
    
    // 设置选中文档
    setSelectedDocument: (state, action: PayloadAction<string | null>) => {
      state.selectedDocument = action.payload;
    },
    
    // 设置选中会议
    setSelectedMeeting: (state, action: PayloadAction<string | null>) => {
      state.selectedMeeting = action.payload;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

// 导出动作创建器
export const {
  loadNotesRequest,
  loadNotesSuccess,
  loadNotesFailure,
  loadDocumentsRequest,
  loadDocumentsSuccess,
  loadDocumentsFailure,
  loadMeetingsRequest,
  loadMeetingsSuccess,
  loadMeetingsFailure,
  createNote,
  updateNote,
  deleteNote,
  uploadDocument,
  updateDocument,
  accessDocument,
  deleteDocument,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  setSelectedNote,
  setSelectedDocument,
  setSelectedMeeting,
  clearError,
} = productivitySlice.actions;

// 导出reducer
export default productivitySlice.reducer;
