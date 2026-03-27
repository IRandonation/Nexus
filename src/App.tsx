import { useEffect, useState, useRef } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useTopicStore } from '@/stores/topicStore';
import { useAI } from '@/hooks/useAI';
import { TaskList } from '@/components/task/TaskList';
import { StatsPanel } from '@/components/stats/StatsPanel';
import { Settings } from '@/components/settings/Settings';
import { InsightPanel } from '@/components/insight/InsightPanel';
import { TaskCreateDialog } from '@/components/task/TaskCreateDialog';
import { TopicSidebar } from '@/components/topic';
import { Search, Plus, Sparkles, Menu } from '@/components/ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

type Page = 'tasks' | 'history' | 'insight' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('tasks');
  const [input, setInput] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const loadTasks = useTaskStore((state: { loadTasks: () => void }) => state.loadTasks);
  const addTask = useTaskStore(state => state.addTask);
  const tasks = useTaskStore(state => state.tasks);
  const loadTopics = useTopicStore(state => state.loadTopics);
  const selectedTopicId = useTopicStore(state => state.selectedTopicId);
  const { parseIntent, clearIntent, isParsing, parsedIntent } = useAI();
  
  useEffect(() => {
    console.log('[App] selectedTopicId changed:', selectedTopicId);
  }, [selectedTopicId]);
  
  useEffect(() => {
    console.log('[App] Initializing...');
    loadTasks();
    loadTopics();
  }, [loadTasks, loadTopics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim().length > 5) {
        parseIntent(input, selectedTopicId || undefined);
      } else {
        clearIntent();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input, selectedTopicId, parseIntent, clearIntent]);
  
  const handleCreateTask = async () => {
    if (!input.trim()) {
      console.log('[App] Empty input, ignoring');
      return;
    }
    
    console.log('[App] Creating task:', {
      input,
      selectedTopicId,
      selectedTopicIdType: typeof selectedTopicId,
      parsedIntent
    });
    
    await addTask(parsedIntent?.event || input, { 
      datetime: parsedIntent?.datetime || undefined,
      entities: parsedIntent?.entities || undefined,
      event: parsedIntent?.event || undefined,
      topicId: selectedTopicId || undefined 
    });
    setInput('');
    clearIntent();
  };

  const handleDecompose = async () => {
    if (!parsedIntent?.subtasks) return;
    for (const subtask of parsedIntent.subtasks) {
      await addTask(subtask, {
        datetime: parsedIntent?.datetime || undefined,
        entities: parsedIntent?.entities || undefined,
        event: parsedIntent?.event || undefined,
        topicId: selectedTopicId || undefined,
      });
    }
    setInput('');
    clearIntent();
  };

  const filteredTasks = selectedTopicId 
    ? tasks.filter(t => t.topicId === selectedTopicId)
    : tasks;
  
  const renderPage = () => {
    switch (currentPage) {
      case 'tasks':
        return (
          <>
            <StatsPanel />
            <div className="glass-container p-6">
              <TaskList tasks={filteredTasks} />
            </div>
          </>
        );
      case 'insight':
        return <InsightPanel />;
      case 'settings':
        return <Settings />;
      case 'history':
        return (
          <div className="glass-container p-6 text-center text-gray-400">
            <p>历史回顾功能开发中...</p>
          </div>
        );
    }
  };
  
  return (
    <div className="h-screen bg-surface-1 flex">
      <TopicSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-glass-border bg-surface-2/80 backdrop-blur-sm flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-medium text-white">
              {selectedTopicId 
                ? useTopicStore.getState().topics.find(t => t.id === selectedTopicId)?.name || '任务'
                : '全部任务'
              }
            </h1>
          </div>
          
          <nav className="flex items-center gap-1">
            {(['tasks', 'history', 'insight', 'settings'] as Page[]).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  currentPage === page 
                    ? 'bg-accent/20 text-accent' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {page === 'tasks' && '任务'}
                {page === 'history' && '历史'}
                {page === 'insight' && '洞察'}
                {page === 'settings' && '设置'}
              </button>
            ))}
          </nav>
        </header>
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {renderPage()}
          </div>
        </div>
        
        <div className="p-4 border-t border-glass-border bg-surface-2">
          <div className="max-w-4xl mx-auto">
            <div className="glass-container p-4">
              <div className="flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                  placeholder="描述您的任务，例如：明天下午三点和导师开会..."
                  className="glass-input text-base flex-1"
                />
                {isParsing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="text-accent" size={20} />
                  </motion.div>
                )}
              </div>
              
              <AnimatePresence>
                {parsedIntent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-glass-border"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 text-sm flex-1">
                        {parsedIntent.event && (
                          <div className="text-white font-medium">{parsedIntent.event}</div>
                        )}
                        {parsedIntent.datetime && (
                          <div className="text-gray-400">{parsedIntent.datetime}</div>
                        )}
                        {parsedIntent.entities && parsedIntent.entities.length > 0 && (
                          <div className="text-gray-400">{parsedIntent.entities.join(', ')}</div>
                        )}
                        {parsedIntent.conflictWarning && (
                          <div className="text-yellow-400 text-xs">{parsedIntent.conflictWarning}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          置信度: {Math.round(parsedIntent.confidence * 100)}%
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        {parsedIntent.subtasks && parsedIntent.subtasks.length > 0 && (
                          <button
                            onClick={handleDecompose}
                            className="glass-button flex items-center gap-2 text-sm"
                          >
                            <Sparkles size={14} className="text-accent" />
                            使用拆解
                          </button>
                        )}
                        <button
                          onClick={handleCreateTask}
                          disabled={!input.trim()}
                          className="glass-button bg-accent/20 border-accent/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={18} />
                          创建任务
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      
      <TaskCreateDialog />
    </div>
  );
}

export default App;