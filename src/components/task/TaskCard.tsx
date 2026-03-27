import React from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, MapPin, Tag } from '@/components/ui/icons';
import type { Task, Topic } from '@/types';

interface TaskCardProps {
  task: Task;
  topic?: Topic;
  onComplete: (id: string) => void;
  onClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, topic, onComplete, onClick }) => {
  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  };
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };
  
  const displayContent = task.event || task.content;
  const formattedDate = formatDate(task.extractedDatetime);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="glass-container p-3 flex items-start gap-3 group hover:bg-white/5 transition-all cursor-pointer"
      onClick={() => onClick?.(task)}
    >
      <div className={`w-1 h-8 rounded-full ${priorityColors[task.priority]} mt-0.5`} />
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete(task.id);
        }}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5
          ${task.status === 'completed' 
            ? 'bg-accent border-accent' 
            : 'border-gray-500 hover:border-accent'
          }`}
      >
        {task.status === 'completed' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={12} className="text-white" />
          </motion.div>
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${
          task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
        }`}>
          {displayContent}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {topic && (
            <span
              className="px-1.5 py-0.5 rounded text-xs text-white"
              style={{ backgroundColor: `${topic.color}40`, borderLeft: `2px solid ${topic.color}` }}
            >
              {topic.name}
            </span>
          )}
          
          {formattedDate && (
            <div className="flex items-center gap-1 text-xs text-accent-secondary">
              <Calendar size={10} />
              <span>{formattedDate}</span>
            </div>
          )}
          
          {task.extractedEntities && task.extractedEntities.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-accent-tertiary">
              <MapPin size={10} />
              <span>{task.extractedEntities.join(', ')}</span>
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Tag size={10} />
              <span>{task.tags.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
