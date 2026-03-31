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
    <div className="min-h-[180px] p-5 bg-surface-1/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <Search className="text-accent" size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="描述任务，例如：明天下午三点和导师开会"
          className="bg-transparent text-white placeholder-gray-500 text-base flex-1 outline-none"
        />
        {isParsing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="text-accent" size={18} />
          </motion.div>
        )}
        <button
          onClick={handleClose}
          className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      
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
    </div>
  );
};
