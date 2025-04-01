import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 创意服务状态接口
interface CreativeState {
  projects: CreativeProject[];
  generatedContent: GeneratedContent[];
  recommendations: ContentRecommendation[];
  arContent: ARContent[];
  selectedProject: string | null; // 项目ID
  selectedContent: string | null; // 内容ID
  loading: boolean;
  error: string | null;
}

// 创意项目接口
interface CreativeProject {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'mixed';
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  tags?: string[];
  content: string[]; // 关联的生成内容ID列表
  createdAt: string;
  updatedAt: string;
}

// 生成内容接口
interface GeneratedContent {
  id: string;
  projectId?: string;
  type: 'text' | 'image' | 'audio' | 'video';
  prompt: string;
  result: ContentResult;
  parameters?: Record<string, any>; // 生成参数
  isFavorite: boolean;
  createdAt: string;
}

// 内容结果接口
interface ContentResult {
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  metadata?: Record<string, any>;
}

// 内容推荐接口
interface ContentRecommendation {
  id: string;
  title: string;
  description?: string;
  type: 'article' | 'image' | 'audio' | 'video' | 'app' | 'other';
  source: string;
  url: string;
  thumbnail?: string;
  tags?: string[];
  relevanceScore: number; // 0-100
  createdAt: string;
}

// AR内容接口
interface ARContent {
  id: string;
  title: string;
  description?: string;
  type: 'model' | 'animation' | 'effect' | 'scene';
  url: string;
  thumbnail?: string;
  size: number;
  duration?: number; // 秒
  isFavorite: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

// 初始状态
const initialState: CreativeState = {
  projects: [],
  generatedContent: [],
  recommendations: [],
  arContent: [],
  selectedProject: null,
  selectedContent: null,
  loading: false,
  error: null,
};

// 创建创意服务切片
const creativeSlice = createSlice({
  name: 'creative',
  initialState,
  reducers: {
    // 加载项目请求
    loadProjectsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载项目成功
    loadProjectsSuccess: (state, action: PayloadAction<CreativeProject[]>) => {
      state.projects = action.payload;
      state.loading = false;
    },
    // 加载项目失败
    loadProjectsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载生成内容请求
    loadGeneratedContentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载生成内容成功
    loadGeneratedContentSuccess: (state, action: PayloadAction<GeneratedContent[]>) => {
      state.generatedContent = action.payload;
      state.loading = false;
    },
    // 加载生成内容失败
    loadGeneratedContentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载推荐内容请求
    loadRecommendationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载推荐内容成功
    loadRecommendationsSuccess: (state, action: PayloadAction<ContentRecommendation[]>) => {
      state.recommendations = action.payload;
      state.loading = false;
    },
    // 加载推荐内容失败
    loadRecommendationsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 加载AR内容请求
    loadARContentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 加载AR内容成功
    loadARContentSuccess: (state, action: PayloadAction<ARContent[]>) => {
      state.arContent = action.payload;
      state.loading = false;
    },
    // 加载AR内容失败
    loadARContentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 创建项目
    createProject: (state, action: PayloadAction<Omit<CreativeProject, 'id' | 'content' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date().toISOString();
      const newProject: CreativeProject = {
        ...action.payload,
        id: Date.now().toString(),
        content: [],
        createdAt: now,
        updatedAt: now,
      };
      state.projects.push(newProject);
    },
    
    // 更新项目
    updateProject: (state, action: PayloadAction<{ id: string; project: Partial<CreativeProject> }>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          ...action.payload.project,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    // 删除项目
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
      if (state.selectedProject === action.payload) {
        state.selectedProject = null;
      }
    },
    
    // 生成内容请求
    generateContentRequest: (state, action: PayloadAction<{ projectId?: string; type: 'text' | 'image' | 'audio' | 'video'; prompt: string; parameters?: Record<string, any> }>) => {
      state.loading = true;
      state.error = null;
    },
    
    // 生成内容成功
    generateContentSuccess: (state, action: PayloadAction<GeneratedContent>) => {
      state.generatedContent.push(action.payload);
      
      // 如果有关联项目，将内容ID添加到项目中
      if (action.payload.projectId) {
        const projectIndex = state.projects.findIndex(p => p.id === action.payload.projectId);
        if (projectIndex !== -1) {
          state.projects[projectIndex].content.push(action.payload.id);
          state.projects[projectIndex].updatedAt = new Date().toISOString();
        }
      }
      
      state.loading = false;
    },
    
    // 生成内容失败
    generateContentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 切换收藏内容
    toggleFavoriteContent: (state, action: PayloadAction<string>) => {
      const index = state.generatedContent.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.generatedContent[index].isFavorite = !state.generatedContent[index].isFavorite;
      }
    },
    
    // 删除生成内容
    deleteGeneratedContent: (state, action: PayloadAction<string>) => {
      const content = state.generatedContent.find(c => c.id === action.payload);
      
      // 如果内容有关联项目，从项目中移除内容ID
      if (content && content.projectId) {
        const projectIndex = state.projects.findIndex(p => p.id === content.projectId);
        if (projectIndex !== -1) {
          state.projects[projectIndex].content = state.projects[projectIndex].content.filter(id => id !== action.payload);
          state.projects[projectIndex].updatedAt = new Date().toISOString();
        }
      }
      
      state.generatedContent = state.generatedContent.filter(c => c.id !== action.payload);
      if (state.selectedContent === action.payload) {
        state.selectedContent = null;
      }
    },
    
    // 切换收藏AR内容
    toggleFavoriteARContent: (state, action: PayloadAction<string>) => {
      const index = state.arContent.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.arContent[index].isFavorite = !state.arContent[index].isFavorite;
      }
    },
    
    // 使用AR内容
    useARContent: (state, action: PayloadAction<string>) => {
      const index = state.arContent.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.arContent[index].lastUsedAt = new Date().toISOString();
      }
    },
    
    // 删除AR内容
    deleteARContent: (state, action: PayloadAction<string>) => {
      state.arContent = state.arContent.filter(c => c.id !== action.payload);
    },
    
    // 设置选中项目
    setSelectedProject: (state, action: PayloadAction<string | null>) => {
      state.selectedProject = action.payload;
    },
    
    // 设置选中内容
    setSelectedContent: (state, action: PayloadAction<string | null>) => {
      state.selectedContent = action.payload;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

// 导出动作创建器
export const {
  loadProjectsRequest,
  loadProjectsSuccess,
  loadProjectsFailure,
  loadGeneratedContentRequest,
  loadGeneratedContentSuccess,
  loadGeneratedContentFailure,
  loadRecommendationsRequest,
  loadRecommendationsSuccess,
  loadRecommendationsFailure,
  loadARContentRequest,
  loadARContentSuccess,
  loadARContentFailure,
  createProject,
  updateProject,
  deleteProject,
  generateContentRequest,
  generateContentSuccess,
  generateContentFailure,
  toggleFavoriteContent,
  deleteGeneratedContent,
  toggleFavoriteARContent,
  useARContent,
  deleteARContent,
  setSelectedProject,
  setSelectedContent,
  clearError,
} = creativeSlice.actions;

// 导出reducer
export default creativeSlice.reducer;
