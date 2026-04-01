import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopicStore } from '@/stores/topicStore';
import { useTaskStore } from '@/stores/taskStore';
import { Plus, Check, ChevronDown, FolderOpen, MoreHorizontal } from '@/components/ui/icons';
import { normalizeTopicColor, withAlpha } from '@/utils/color';

interface TopicSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const TopicSidebar: React.FC<TopicSidebarProps> = ({ collapsed, onToggle }) => {
  const { topics, presetColors, loadTopics, loadPresetColors, createTopic, deleteTopic, selectedTopicId, setSelectedTopic } = useTopicStore();
  const tasks = useTaskStore(state => state.tasks);
  const [isCreating, setIsCreating] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#64748B');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useState(() => {
    loadTopics();
    loadPresetColors();
  });

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    await createTopic({ name: newTopicName.trim(), color: normalizeTopicColor(selectedColor) });
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
          className="p-2 text-gray-400 hover:text-white transition-colors motion-fast"
        >
          <FolderOpen size={20} />
        </button>
        <div className="mt-4 space-y-2">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id === selectedTopicId ? null : topic.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all motion-fast"
              style={{ 
                backgroundColor: topic.id === selectedTopicId ? withAlpha(topic.color, 0.25) : 'transparent',
                borderLeft: `3px solid ${normalizeTopicColor(topic.color)}`,
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
      <div className="flex items-center justify-between p-4 glass-divider-bottom">
        <h2 className="text-sm font-medium text-white">任务主题</h2>
        <button
          onClick={onToggle}
          className="p-1 text-gray-400 hover:text-white transition-colors motion-fast"
        >
          <ChevronDown size={16} className="rotate-[-90deg]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => setSelectedTopic(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all motion-fast hover:bg-glass-highlight mb-1 ${
            !selectedTopicId ? 'bg-glass-highlight' : ''
          }`}
        >
          <span className="text-gray-200">全部任务</span>
          <span className="text-xs text-gray-400 ml-2">{tasks.filter(t => t.status === 'pending').length}</span>
        </button>

        <div className="space-y-1 mt-2">
          {topics.map(topic => {
            const count = getTaskCount(topic.id);
            const isSelected = topic.id === selectedTopicId;
            const isMenuOpen = openMenuId === topic.id;
            return (
              <div key={topic.id} className="relative group">
                <button
                  onClick={() => setSelectedTopic(isSelected ? null : topic.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all motion-fast hover:bg-glass-highlight flex items-center gap-2 ${
                    isSelected ? 'bg-glass-highlight' : ''
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: normalizeTopicColor(topic.color) }}
                  />
                  <span className="text-white truncate flex-1">{topic.name}</span>
                  {count > 0 && (
                    <span className="text-xs text-gray-400">{count}</span>
                  )}
                  {isSelected && <Check size={12} className="text-gray-300" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(isMenuOpen ? null : topic.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-glass-highlight text-gray-400 hover:text-white transition-colors motion-fast opacity-0 group-hover:opacity-100"
                  style={{ opacity: isMenuOpen ? 1 : undefined }}
                >
                  <MoreHorizontal size={14} />
                </button>
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-2 top-full mt-1 z-50 bg-surface-1 border border-glass-border rounded-lg shadow-lg overflow-hidden min-w-[100px]">
                      <button
                        onClick={async () => {
                          await deleteTopic(topic.id);
                          await loadTopics();
                          setOpenMenuId(null);
                          if (selectedTopicId === topic.id) {
                            setSelectedTopic(null);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-glass-highlight transition-colors motion-fast flex items-center gap-2"
                      >
                        删除
                      </button>
                    </div>
                  </>
                )}
              </div>
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
            className="glass-divider-top p-3 space-y-2"
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
                   style={{ backgroundColor: normalizeTopicColor(color) }}
                 />
               ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTopic}
                disabled={!newTopicName.trim()}
                className="glass-button flex-1 text-xs bg-glass-highlight disabled:opacity-50"
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

      <div className="p-3 glass-divider-top">
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
