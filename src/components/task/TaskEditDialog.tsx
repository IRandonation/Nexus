import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar, MapPin, Tag, Trash2 } from '@/components/ui/icons';
import type { Task } from '@/types';

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editedTask) {
      onDelete(editedTask.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-container w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-glass-border">
            <h3 className="text-lg font-semibold text-white">编辑任务</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">任务内容</label>
              <textarea
                value={editedTask.content}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, content: e.target.value })
                }
                className="glass-input w-full bg-white/5 rounded px-3 py-2 text-sm min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Calendar size={10} /> 时间
              </label>
              <input
                type="text"
                value={editedTask.extractedDatetime || ''}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    extractedDatetime: e.target.value,
                  })
                }
                placeholder="例如：明天下午3点"
                className="glass-input w-full bg-white/5 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <MapPin size={10} /> 相关人/地点
              </label>
              <input
                type="text"
                value={editedTask.extractedEntities?.join(', ') || ''}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    extractedEntities: e.target.value
                      .split(',')
                      .map((s) => s.trim()),
                  })
                }
                placeholder="用逗号分隔..."
                className="glass-input w-full bg-white/5 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Tag size={10} /> 标签
              </label>
              <input
                type="text"
                value={editedTask.tags?.join(', ') || ''}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    tags: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                placeholder="用逗号分隔..."
                className="glass-input w-full bg-white/5 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">优先级</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() =>
                      setEditedTask({ ...editedTask, priority: p })
                    }
                    className={`glass-button flex-1 ${
                      editedTask.priority === p
                        ? 'bg-accent/20 border-accent/30'
                        : ''
                    }`}
                  >
                    {p === 'low' && '低'}
                    {p === 'medium' && '中'}
                    {p === 'high' && '高'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-glass-border flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 glass-button bg-accent/20 hover:bg-accent/30 border-accent/30 flex items-center justify-center gap-2"
            >
              <Check size={16} />
              保存
            </button>
            <button
              onClick={handleDelete}
              className="glass-button text-red-400 hover:text-red-300 flex items-center gap-2"
            >
              <Trash2 size={16} />
              删除
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
