import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Sparkles, Lightbulb, AlertTriangle } from '@/components/ui/icons';
import type { ParsedIntent } from '@/types';

interface IntentPreviewProps {
  intent: ParsedIntent;
  onConfirm: () => void;
  onDecompose?: () => void;
}

export const IntentPreview: React.FC<IntentPreviewProps> = ({
  intent,
  onConfirm,
  onDecompose,
}) => {
  const confidenceColor = intent.confidence > 0.8
    ? 'text-gray-200'
    : intent.confidence > 0.5
      ? 'text-gray-300'
      : 'text-gray-400';
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 pt-4 glass-divider-top"
    >
      <div className="space-y-3 text-sm">
        {intent.event && (
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-gray-300" />
            <span className="text-white font-medium">{intent.event}</span>
          </div>
        )}
        
        {intent.datetime && (
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={14} className="text-gray-400" />
            <span>{intent.datetime}</span>
          </div>
        )}
        
        {intent.entities.length > 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            <User size={14} className="text-gray-400" />
            <span>{intent.entities.join(', ')}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">置信度:</span>
          <span className={confidenceColor}>
            {Math.round(intent.confidence * 100)}%
          </span>
        </div>
        
        {intent.conflictWarning && (
          <div className="flex items-start gap-2 p-2 bg-glass-highlight rounded-lg">
            <AlertTriangle size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300 text-xs">{intent.conflictWarning}</span>
          </div>
        )}
        
        {intent.subtasks && intent.subtasks.length > 0 && (
           <div className="mt-3 p-3 bg-glass-highlight rounded-lg">
             <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
               <Sparkles size={12} />
               <span>AI 建议拆解为:</span>
             </div>
            <ul className="space-y-1">
              {intent.subtasks.map((subtask, idx) => (
                 <li key={idx} className="text-gray-400 text-sm flex items-center gap-2">
                   <span className="w-4 h-4 rounded-full bg-glass-active text-gray-200 text-xs flex items-center justify-center">
                     {idx + 1}
                   </span>
                  {subtask}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={onConfirm}
          className="glass-button flex-1 bg-glass-highlight hover:bg-glass-active border-glass-border"
        >
          确认添加
        </button>
        
        {intent.subtasks && intent.subtasks.length > 0 && onDecompose && (
          <button
            onClick={onDecompose}
            className="glass-button flex items-center gap-2"
          >
            <Sparkles size={14} className="text-gray-400" />
            使用拆解
          </button>
        )}
      </div>
    </motion.div>
  );
};
