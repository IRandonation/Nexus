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
    ? 'text-green-400' 
    : intent.confidence > 0.5 
      ? 'text-yellow-400' 
      : 'text-red-400';
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 pt-4 border-t border-glass-border"
    >
      <div className="space-y-3 text-sm">
        {intent.event && (
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-accent" />
            <span className="text-white font-medium">{intent.event}</span>
          </div>
        )}
        
        {intent.datetime && (
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={14} className="text-accent-secondary" />
            <span>{intent.datetime}</span>
          </div>
        )}
        
        {intent.entities.length > 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            <User size={14} className="text-accent-tertiary" />
            <span>{intent.entities.join(', ')}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">置信度:</span>
          <span className={confidenceColor}>
            {Math.round(intent.confidence * 100)}%
          </span>
        </div>
        
        {intent.conflictWarning && (
          <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <span className="text-yellow-400 text-xs">{intent.conflictWarning}</span>
          </div>
        )}
        
        {intent.subtasks && intent.subtasks.length > 0 && (
          <div className="mt-3 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 text-accent text-xs mb-2">
              <Sparkles size={12} />
              <span>AI 建议拆解为:</span>
            </div>
            <ul className="space-y-1">
              {intent.subtasks.map((subtask, idx) => (
                <li key={idx} className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center">
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
          className="glass-button flex-1 bg-accent/20 hover:bg-accent/30 border-accent/30"
        >
          确认添加
        </button>
        
        {intent.subtasks && intent.subtasks.length > 0 && onDecompose && (
          <button
            onClick={onDecompose}
            className="glass-button flex items-center gap-2"
          >
            <Sparkles size={14} className="text-accent" />
            使用拆解
          </button>
        )}
      </div>
    </motion.div>
  );
};
