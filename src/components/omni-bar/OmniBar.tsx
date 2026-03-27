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
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="glass-container p-4 w-[600px] relative"
    >
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
      
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入任务，例如：明天下午三点和导师开会..."
          className="glass-input text-base flex-1"
        />
        {isParsing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="text-accent" size={20} />
          </motion.div>
        )}
      </form>
      
      <div className="mt-3 flex items-center gap-2">
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
