import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, Clock } from '@/components/ui/icons';
import { useTaskStore } from '@/stores/taskStore';

export const StatsPanel: React.FC = () => {
  const stats = useTaskStore(state => state.getStats());
  
  const items = [
    {
      icon: Circle,
      label: '待办',
      value: stats.pending,
      color: 'text-blue-400',
    },
    {
      icon: CheckCircle2,
      label: '已完成',
      value: stats.completed,
      color: 'text-green-400',
    },
    {
      icon: AlertCircle,
      label: '高优',
      value: stats.highPriority,
      color: 'text-red-400',
    },
    {
      icon: Clock,
      label: '总计',
      value: stats.total,
      color: 'text-gray-400',
    },
  ];
  
  return (
    <div className="glass-container p-6 mb-6">
      <div className="grid grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="text-center"
          >
            <div className={`text-3xl font-bold ${item.color} mb-1`}>
              {item.value}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <item.icon size={12} />
              <span>{item.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
