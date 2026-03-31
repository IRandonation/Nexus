import React from 'react';
import { motion } from 'framer-motion';
import { Grip, Circle, AlertCircle } from '@/components/ui/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useTopicStore } from '@/stores/topicStore';
import { appWindow } from '@tauri-apps/api/window';

export const Widget: React.FC = () => {
  const stats = useTaskStore(state => state.getStats());
  const todayTasks = useTaskStore(state => state.getTodayTasks());
  const topics = useTopicStore(state => state.topics);
  
  const getTopic = (topicId?: string) => {
    if (!topicId) return null;
    return topics.find(t => t.id === topicId);
  };

  const handleDragStart = async () => {
    await appWindow.startDragging();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-container p-4 w-80 select-none"
    >
      <div 
        className="flex justify-center mb-3 cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
      >
        <Grip size={20} className="text-white/40 hover:text-white/60 transition-colors" />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
          <div className="text-xs text-gray-400 uppercase">待办</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-400 uppercase">已完成</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{stats.highPriority}</div>
          <div className="text-xs text-gray-400 uppercase">高优</div>
        </div>
      </div>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {todayTasks.slice(0, 3).map((task) => {
          const topic = getTopic(task.topicId);
          return (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              {task.priority === 'high' ? (
                <AlertCircle size={14} className="text-red-400" />
              ) : (
                <Circle size={14} className="text-gray-500" />
              )}
              <span className="text-gray-300 truncate flex-1">{task.content}</span>
              {topic && (
                <span
                  className="px-1.5 py-0.5 rounded text-xs text-white flex-shrink-0"
                  style={{ backgroundColor: `${topic.color}60` }}
                >
                  {topic.name}
                </span>
              )}
            </div>
          );
        })}
        {todayTasks.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-2">
            今日暂无任务
          </div>
        )}
      </div>
    </motion.div>
  );
};
