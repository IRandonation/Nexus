import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import type { Topic, CreateTopicPayload, UpdateTopicPayload } from '@/types';
import { normalizeTopicColor } from '@/utils/color';

interface TopicStore {
  topics: Topic[];
  presetColors: string[];
  isLoading: boolean;
  selectedTopicId: string | null;
  
  loadTopics: () => Promise<void>;
  loadPresetColors: () => Promise<void>;
  createTopic: (payload: CreateTopicPayload) => Promise<Topic>;
  updateTopic: (payload: UpdateTopicPayload) => Promise<Topic>;
  deleteTopic: (id: string) => Promise<void>;
  setSelectedTopic: (id: string | null) => void;
}

export const useTopicStore = create<TopicStore>((set) => ({
  topics: [],
  presetColors: [],
  isLoading: false,
  selectedTopicId: null,
  
  loadTopics: async () => {
    console.log('[TopicStore] Loading topics...');
    set({ isLoading: true });
    try {
      const topics = await invoke<Topic[]>('get_topics');
      console.log(`[TopicStore] Loaded ${topics.length} topics`);
      set({
        topics: topics.map((topic) => ({
          ...topic,
          color: normalizeTopicColor(topic.color),
        })),
        isLoading: false,
      });
    } catch (error) {
      console.error('[TopicStore] Failed to load topics:', error);
      set({ isLoading: false });
    }
  },
  
  loadPresetColors: async () => {
    try {
      const colors = await invoke<string[]>('get_preset_colors');
      set({ presetColors: colors.map((color) => normalizeTopicColor(color)) });
    } catch (error) {
      console.error('[TopicStore] Failed to load preset colors:', error);
    }
  },
  
  createTopic: async (payload: CreateTopicPayload) => {
    const normalizedPayload: CreateTopicPayload = {
      ...payload,
      color: normalizeTopicColor(payload.color ?? '#64748B'),
    };
    console.log('[TopicStore] Creating topic:', normalizedPayload.name);
    try {
      const topic = await invoke<Topic>('create_topic', { payload: normalizedPayload });
      console.log('[TopicStore] Topic created:', topic.id);
      set(state => ({ topics: [...state.topics, topic] }));
      return topic;
    } catch (error) {
      console.error('[TopicStore] Failed to create topic:', error);
      alert(error);
      throw error;
    }
  },
  
  updateTopic: async (payload: UpdateTopicPayload) => {
    const normalizedPayload: UpdateTopicPayload = payload.color
      ? { ...payload, color: normalizeTopicColor(payload.color) }
      : payload;
    console.log('[TopicStore] Updating topic:', normalizedPayload.id);
    try {
      const topic = await invoke<Topic>('update_topic', { payload: normalizedPayload });
      set(state => ({
        topics: state.topics.map(t => t.id === topic.id ? topic : t)
      }));
      return topic;
    } catch (error) {
      console.error('[TopicStore] Failed to update topic:', error);
      alert(error);
      throw error;
    }
  },
  
  deleteTopic: async (id: string) => {
    console.log('[TopicStore] Deleting topic:', id);
    try {
      await invoke('delete_topic', { id });
      set(state => ({
        topics: state.topics.filter(t => t.id !== id),
        selectedTopicId: state.selectedTopicId === id ? null : state.selectedTopicId
      }));
    } catch (error) {
      console.error('[TopicStore] Failed to delete topic:', error);
      throw error;
    }
  },
  
  setSelectedTopic: (id: string | null) => {
    set({ selectedTopicId: id });
  },
}));
