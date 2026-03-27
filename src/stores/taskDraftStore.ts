import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import type { TaskDraft } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TaskDraftStore {
  draft: TaskDraft | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  showDialog: boolean;
  
  startConversation: (initialInput: string, topicId?: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  updateDraft: (updates: Partial<TaskDraft>) => void;
  confirmTask: () => Promise<boolean>;
  reset: () => void;
  setShowDialog: (show: boolean) => void;
}

export const useTaskDraftStore = create<TaskDraftStore>((set, get) => ({
  draft: null,
  messages: [],
  isLoading: false,
  error: null,
  showDialog: false,
  
  startConversation: async (initialInput: string, topicId?: string) => {
    set({ isLoading: true, error: null, messages: [] });
    try {
      const result = await invoke<any>('parse_intent', { input: initialInput, topicId: topicId || null });
      console.log('[TaskDraftStore] Initial parse:', result);
      
      const draft: TaskDraft = {
        content: initialInput,
        extractedDatetime: result.datetime,
        extractedEntities: result.entities,
        event: result.event,
        tags: [],
        subtasks: result.subtasks || [],
        confidence: result.confidence,
        topicId: topicId,
      };
      
      set({
        draft,
        messages: [
          { role: 'user', content: initialInput },
          { 
            role: 'assistant', 
            content: `已理解您的任务：${result.event || initialInput}\n时间：${result.datetime || '未指定'}\n相关：${result.entities?.join(', ') || '无'}\n\n您可以继续对话来修改任务，或直接确认创建。` 
          },
        ],
        showDialog: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('[TaskDraftStore] Failed to parse:', error);
      set({ 
        error: 'AI 解析失败，请检查 API Key 设置',
        isLoading: false,
        draft: {
          content: initialInput,
          confidence: 0,
        },
        messages: [
          { role: 'user', content: initialInput },
          { role: 'assistant', content: '解析失败，您可以直接确认创建此任务，或修改描述后重试。' },
        ],
        showDialog: true,
      });
    }
  },
  
  sendMessage: async (message: string) => {
    const { messages, draft } = get();
    if (!draft) return;
    
    set({ 
      messages: [...messages, { role: 'user', content: message }],
      isLoading: true,
      error: null,
    });
    
    try {
      const contextMessages = [...messages, { role: 'user', content: message }];
      const context = contextMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const result = await invoke<any>('parse_intent', { 
        input: `对话上下文：\n${context}\n\n当前任务：${draft.content}\n\n用户修改：${message}` 
      });
      
      console.log('[TaskDraftStore] Refined parse:', result);
      
      set({
        draft: {
          ...draft,
          extractedDatetime: result.datetime || draft.extractedDatetime,
          extractedEntities: result.entities || draft.extractedEntities,
          event: result.event || draft.event,
          subtasks: result.subtasks || draft.subtasks,
          confidence: result.confidence,
        },
        messages: [
          ...get().messages,
          { 
            role: 'assistant', 
            content: `已更新：${result.event || draft.event}\n时间：${result.datetime || draft.extractedDatetime || '未指定'}\n您可以继续修改或确认。` 
          },
        ],
        isLoading: false,
      });
    } catch (error) {
      console.error('[TaskDraftStore] Failed to refine:', error);
      set({
        messages: [
          ...get().messages,
          { role: 'assistant', content: '抱歉，更新失败。请重试或确认当前任务。' },
        ],
        isLoading: false,
      });
    }
  },
  
  updateDraft: (updates) => {
    const { draft } = get();
    if (draft) {
      set({ draft: { ...draft, ...updates } });
    }
  },
  
  confirmTask: async () => {
    const { draft } = get();
    if (!draft) return false;
    
    try {
      await invoke('create_task', {
        content: draft.content,
        extractedDatetime: draft.extractedDatetime,
        extractedEntities: draft.extractedEntities,
        event: draft.event,
        topicId: draft.topicId,
      });
      console.log('[TaskDraftStore] Task created');
      
      await invoke('load_tasks');
      console.log('[TaskDraftStore] Tasks reloaded');
      
      get().reset();
      return true;
    } catch (error) {
      console.error('[TaskDraftStore] Failed to create task:', error);
      set({ error: '创建任务失败' });
      return false;
    }
  },
  
  reset: () => {
    set({
      draft: null,
      messages: [],
      isLoading: false,
      error: null,
      showDialog: false,
    });
  },
  
  setShowDialog: (show) => set({ showDialog: show }),
}));
