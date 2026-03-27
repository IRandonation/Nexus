import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopicStore } from '@/stores/topicStore';
import { useTaskStore } from '@/stores/taskStore';
import { Plus, Check, ChevronDown, FolderOpen } from '@/components/ui/icons';

interface TopicSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const TopicSidebar: React.FC<TopicSidebarProps> = ({ collapsed, onToggle }) => {
  const { topics, presetColors, loadTopics, loadPresetColors, createTopic, selectedTopicId, setSelectedTopic } = useTopicStore();
  const tasks = useTaskStore(state => state.tasks);
  const [isCreating, setIsCreating] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  useState(() => {
    loadTopics();
    loadPresetColors();
  });

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    await createTopic({ name: newTopicName.trim(), color: selectedColor });
    await loadTopics();
    setNewTopicName('');
    setIsCreating(false);
  };

  const getTaskCount = (topicId: string) => {
    return tasks.filter(t => t.topicId === topicId && t.status === 'pending').length;
  };

  if (collapsed) {
    return (
      <div className="w-12 h-full bg-surface-2 border-r border-glass-border flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <FolderOpen size={20} />
        </button>
        <div className="mt-4 space-y-2">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id === selectedTopicId ? null : topic.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ 
                backgroundColor: topic.id === selectedTopicId ? `${topic.color}40` : 'transparent',
                borderLeft: `3px solid ${topic.color}`,
              }}
              title={topic.name}
            >
              <span className="text-xs text-white">{topic.name.charAt(0)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 240 }}
      className="h-full bg-surface-2 border-r border-glass-border flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        <h2 className="text-sm font-medium text-white">任务主题</h2>
        <button
          onClick={onToggle}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronDown size={16} className="rotate-[-90deg]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => setSelectedTopic(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5 mb-1 ${
            !selectedTopicId ? 'bg-white/10' : ''
          }`}
        >
          <span className="text-gray-300">全部任务</span>
          <span className="text-xs text-gray-500 ml-2">{tasks.filter(t => t.status === 'pending').length}</span>
        </button>

        <div className="space-y-1 mt-2">
          {topics.map(topic => {
            const count = getTaskCount(topic.id);
            const isSelected = topic.id === selectedTopicId;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(isSelected ? null : topic.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5 flex items-center gap-2 ${
                  isSelected ? 'bg-white/10' : ''
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: topic.color }}
                />
                <span className="text-white truncate flex-1">{topic.name}</span>
                {count > 0 && (
                  <span className="text-xs text-gray-500">{count}</span>
                )}
                {isSelected && <Check size={12} className="text-accent" />}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-glass-border p-3 space-y-2"
          >
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="主题名称..."
              className="glass-input w-full text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTopic()}
            />
            <div className="flex flex-wrap gap-1">
              {presetColors.slice(0, 6).map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    selectedColor === color ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTopic}
                disabled={!newTopicName.trim()}
                className="glass-button flex-1 text-xs bg-accent/20 disabled:opacity-50"
              >
                创建
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="glass-button text-xs"
              >
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 border-t border-glass-border">
        {isCreating ? null : (
          <button
            onClick={() => setIsCreating(true)}
            className="glass-button w-full flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={14} />
            新建主题
          </button>
        )}
      </div>
    </motion.div>
  );
};