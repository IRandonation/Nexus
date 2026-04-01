import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check, Calendar, MapPin, Tag, Sparkles } from '@/components/ui/icons';
import { useTaskDraftStore } from '@/stores/taskDraftStore';

export const TaskCreateDialog: React.FC = () => {
  const { 
    draft, 
    messages, 
    isLoading, 
    showDialog, 
    sendMessage, 
    updateDraft, 
    confirmTask, 
    reset,
    setShowDialog,
  } = useTaskDraftStore();
  
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (!showDialog || !draft) return null;
  
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };
  
  const handleConfirm = async () => {
    const success = await confirmTask();
    if (success) {
      reset();
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-glass z-[60] flex items-center justify-center"
        onClick={() => setShowDialog(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-modal w-[800px] max-w-[90vw] max-h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 glass-divider-bottom">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gray-300" size={20} />
              <h3 className="text-lg font-semibold text-white">创建任务</h3>
            </div>
            <button
              onClick={() => setShowDialog(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors motion-fast"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col glass-divider-right">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-glass-active text-white'
                          : 'bg-glass-highlight text-gray-300'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap text-sm font-sans">{msg.content}</pre>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-glass-highlight p-3 rounded-2xl flex items-center gap-2">
                      <Sparkles className="text-gray-300 animate-spin" size={16} />
                      <span className="text-gray-400 text-sm">思考中...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 glass-divider-top">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="输入修改建议..."
                    className="glass-input flex-1 bg-glass-highlight rounded-lg px-4 py-2"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="glass-button bg-glass-highlight disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="w-80 p-4 bg-surface-2 flex flex-col">
              <h4 className="text-sm font-medium text-gray-400 mb-4">任务详情</h4>
              
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">任务名称</label>
                  <input
                    type="text"
                    value={draft.event || draft.content}
                    onChange={(e) => updateDraft({ event: e.target.value })}
                    className="glass-input w-full bg-glass-highlight rounded px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                    <Calendar size={10} /> 时间
                  </label>
                  <input
                    type="text"
                    value={draft.extractedDatetime || ''}
                    onChange={(e) => updateDraft({ extractedDatetime: e.target.value })}
                    placeholder="添加时间..."
                    className="glass-input w-full bg-glass-highlight rounded px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                    <MapPin size={10} /> 相关人/地点
                  </label>
                  <input
                    type="text"
                    value={draft.extractedEntities?.join(', ') || ''}
                    onChange={(e) => updateDraft({ extractedEntities: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="用逗号分隔..."
                    className="glass-input w-full bg-glass-highlight rounded px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                    <Tag size={10} /> 标签
                  </label>
                  <input
                    type="text"
                    value={draft.tags?.join(', ') || ''}
                    onChange={(e) => updateDraft({ tags: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="用逗号分隔..."
                    className="glass-input w-full bg-glass-highlight rounded px-3 py-2 text-sm"
                  />
                </div>
                
                {draft.subtasks && draft.subtasks.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">子任务</label>
                    <ul className="space-y-1">
                      {draft.subtasks.map((subtask, idx) => (
<li key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                           <span className="w-5 h-5 rounded-full bg-glass-highlight text-gray-300 text-xs flex items-center justify-center flex-shrink-0">
                             {idx + 1}
                           </span>
                           <span className="truncate">{subtask}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-2 glass-divider-top">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">AI 置信度</span>
                    <span className={draft.confidence > 0.7 ? 'text-gray-200' : draft.confidence > 0.4 ? 'text-gray-300' : 'text-gray-400'}>
                      {Math.round(draft.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 glass-divider-top space-y-2">
                <button
                  onClick={handleConfirm}
                  className="w-full glass-button bg-glass-highlight hover:bg-glass-active border-glass-border flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  确认创建
                </button>
                <button
                  onClick={reset}
                  className="w-full glass-button text-gray-400 hover:text-white"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
