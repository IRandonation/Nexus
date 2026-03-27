import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import type { Task, TaskStats } from '@/types';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  
  loadTasks: () => Promise<void>;
  addTask: (input: string, parsedData?: { datetime?: string; entities?: string[]; event?: string; topicId?: string }) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string, reason?: string) => Promise<void>;
  getTodayTasks: () => Task[];
  getStats: () => TaskStats;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  
loadTasks: async () => {
    console.log('[TaskStore] Loading tasks...');
    set({ isLoading: true });
    try {
      const tasks = await invoke<Task[]>('get_tasks');
      console.log(`[TaskStore] Loaded ${tasks.length} tasks:`, tasks);
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('[TaskStore] Failed to load tasks:', error);
      set({ isLoading: false });
    }
  },
  
  addTask: async (input: string, parsedData?: { datetime?: string; entities?: string[]; event?: string; topicId?: string }) => {
    console.log('[TaskStore] Adding task:', { input, parsedData });
    try {
      const task = await invoke<Task>('create_task', {
        content: input,
        extractedDatetime: parsedData?.datetime ?? null,
        extractedEntities: parsedData?.entities ?? null,
        event: parsedData?.event ?? null,
        topicId: parsedData?.topicId ?? null,
      });
      console.log('[TaskStore] Task created:', task);
      console.log('[TaskStore] Task.topicId:', task.topicId);
      set(state => ({ tasks: [task, ...state.tasks] }));
    } catch (error) {
      console.error('[TaskStore] Failed to add task:', error);
    }
  },
  
  updateTask: async (task: Task) => {
    console.log('[TaskStore] Updating task:', task.id);
    try {
      await invoke('update_task', { task });
      console.log('[TaskStore] Task updated');
      get().loadTasks();
    } catch (error) {
      console.error('[TaskStore] Failed to update task:', error);
    }
  },
  
  deleteTask: async (id: string) => {
    console.log('[TaskStore] Deleting task:', id);
    try {
      await invoke('delete_task', { id });
      console.log('[TaskStore] Task deleted');
      get().loadTasks();
    } catch (error) {
      console.error('[TaskStore] Failed to delete task:', error);
    }
  },
  
  completeTask: async (id: string, reason?: string) => {
    console.log('[TaskStore] Completing task:', id, reason ? `reason: ${reason}` : '');
    try {
      await invoke('complete_task', { id, reason });
      console.log('[TaskStore] Task completed, reloading...');
      get().loadTasks();
    } catch (error) {
      console.error('[TaskStore] Failed to complete task:', error);
    }
  },
  
  getTodayTasks: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().tasks.filter(task => 
      task.createdAt.startsWith(today) && task.status === 'pending'
    );
  },
  
  getStats: () => {
    const tasks = get().tasks;
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      highPriority: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length,
    };
  },
}));
