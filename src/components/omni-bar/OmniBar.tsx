import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X } from '@/components/ui/icons';
import { invoke } from '@tauri-apps/api/tauri';
import { useTaskStore } from '@/stores/taskStore';
import { useTopicStore } from '@/stores/topicStore';
import { useAI } from '@/hooks/useAI';
import { IntentPreview } from './IntentPreview';
import { TopicSelector } from '@/components/topic';

export const OmniBar: React.FC = () => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore(state => state.addTask);
  const selectedTopicId = useTopicStore(state => state.selectedTopicId);
  const setSelectedTopic = useTopicStore(state => state.setSelectedTopic);
  const { parseIntent, clearIntent, isParsing, parsedIntent } = useAI();
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim().length > 5) {
        parseIntent(input, selectedTopicId || undefined);
      } else {
        clearIntent();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [input, selectedTopicId, parseIntent, clearIntent]);
  
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) {
      console.log('[OmniBar] Empty input, ignoring submit');
      return;
    }
    
    console.log('[OmniBar] Submitting task:', input, 'topicId:', selectedTopicId, 'parsedIntent:', parsedIntent);
    await addTask(input, {
      datetime: parsedIntent?.datetime || undefined,
      entities: parsedIntent?.entities || undefined,
      event: parsedIntent?.event || undefined,
      topicId: selectedTopicId || undefined,
    });
    setInput('');
    clearIntent();
    
    await invoke('hide_omni_bar');
  }, [input, addTask, clearIntent, selectedTopicId, parsedIntent]);
  
  const handleDecompose = useCallback(async () => {
    if (!parsedIntent?.subtasks) return;
    
    for (const subtask of parsedIntent.subtasks) {
      await addTask(subtask, {
        datetime: parsedIntent?.datetime || undefined,
        entities: parsedIntent?.entities || undefined,
        event: parsedIntent?.event || undefined,
        topicId: selectedTopicId || undefined,
      });
    }
    
    setInput('');
    clearIntent();
    await invoke('hide_omni_bar');
  }, [parsedIntent, addTask, clearIntent, selectedTopicId]);
  
  const handleClose = useCallback(async () => {
    await invoke('hide_omni_bar');
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="relative w-full h-full glass-container px-4 py-3"
    >
      <div className="flex items-center gap-3 h-11">
        <div className="w-8 h-8 rounded-lg bg-glass-highlight flex items-center justify-center">
          <Search className="text-gray-300" size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="添加任务，比如：明天下午三点和导师开会"
          className="h-10 flex-1 rounded-lg bg-glass-highlight px-3 text-[15px] text-white placeholder:text-gray-500 outline-none focus:bg-glass-active transition-colors motion-fast"
        />
        {isParsing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-gray-400"
          >
            <Sparkles size={18} />
          </motion.div>
        )}
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-lg hover:bg-glass-highlight flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors motion-fast"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <TopicSelector
          selectedTopicId={selectedTopicId}
          onSelect={setSelectedTopic}
        />
      </div>

      <AnimatePresence>
        {parsedIntent && (
          <IntentPreview
            intent={parsedIntent}
            onConfirm={handleSubmit}
            onDecompose={parsedIntent.subtasks && parsedIntent.subtasks.length > 0 ? handleDecompose : undefined}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
