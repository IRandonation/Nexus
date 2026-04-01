import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Palette } from '@/components/ui/icons';
import { useTopicStore } from '@/stores/topicStore';
import type { CreateTopicPayload } from '@/types';
import { normalizeTopicColor, withAlpha } from '@/utils/color';

interface TopicSelectorProps {
  selectedTopicId: string | null;
  onSelect: (topicId: string | null) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  selectedTopicId,
  onSelect,
}) => {
  const { topics, presetColors, loadTopics, loadPresetColors, createTopic } = useTopicStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [selectedColor, setSelectedColor] = useState(presetColors[0] || '#64748B');
  const [customColor, setCustomColor] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    loadTopics();
    loadPresetColors();
  }, [loadTopics, loadPresetColors]);

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;

    const payload: CreateTopicPayload = {
      name: newTopicName.trim(),
      color: normalizeTopicColor(showCustomInput && customColor ? customColor : selectedColor),
    };

    try {
      const topic = await createTopic(payload);
      onSelect(topic.id);
      setNewTopicName('');
      setIsCreating(false);
      setShowCustomInput(false);
      setCustomColor('');
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsCreating(!isCreating)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all motion-fast hover:bg-glass-highlight"
        style={selectedTopic ? { 
          backgroundColor: withAlpha(selectedTopic.color, 0.20),
          borderColor: normalizeTopicColor(selectedTopic.color),
          border: '1px solid',
        } : undefined}
      >
        {selectedTopic ? (
          <>
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: normalizeTopicColor(selectedTopic.color) }}
            />
            <span className="text-white">{selectedTopic.name}</span>
          </>
        ) : (
          <>
            <Plus size={14} />
            <span className="text-gray-400">选择主题</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-64 glass-container p-3 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white">选择或新建主题</span>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-white transition-colors motion-fast"
              >
                <X size={14} />
              </button>
            </div>

            {topics.length > 0 && (
              <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                <button
                  onClick={() => { onSelect(null); setIsCreating(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-all motion-fast hover:bg-glass-highlight ${!selectedTopicId ? 'bg-glass-highlight' : ''}`}
                >
                  <span className="text-gray-400">无主题</span>
                </button>
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => { onSelect(topic.id); setIsCreating(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-all motion-fast hover:bg-glass-highlight flex items-center gap-2 ${selectedTopicId === topic.id ? 'bg-glass-highlight' : ''}`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: normalizeTopicColor(topic.color) }}
                    />
                    <span className="text-white truncate">{topic.name}</span>
                    {selectedTopicId === topic.id && <Check size={12} className="ml-auto text-gray-300" />}
                  </button>
                ))}
              </div>
            )}

            <div className="glass-divider-top pt-3">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="新主题名称..."
                className="glass-input w-full text-sm mb-2"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTopic()}
              />

              <div className="flex flex-wrap gap-1.5 mb-2">
                {presetColors.slice(0, 6).map(color => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setShowCustomInput(false); }}
                    className={`w-6 h-6 rounded-full transition-transform motion-fast ${selectedColor === color && !showCustomInput ? 'ring-2 ring-white scale-110' : 'hover:scale-110'}`}
                     style={{ backgroundColor: normalizeTopicColor(color) }}
                   />
                ))}
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className={`w-6 h-6 rounded-full border border-dashed border-gray-500 flex items-center justify-center hover:border-white transition-colors motion-fast ${showCustomInput ? 'border-white' : ''}`}
                >
                  <Palette size={12} className="text-gray-400" />
                </button>
              </div>

              {showCustomInput && (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={customColor || '#64748B'}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-400">自定义颜色</span>
                </div>
              )}

              <button
                onClick={handleCreateTopic}
                disabled={!newTopicName.trim()}
                className="glass-button w-full bg-glass-highlight hover:bg-glass-active disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建主题
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
