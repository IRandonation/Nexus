import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useTopicStore } from '@/stores/topicStore';
import { TaskCard } from './TaskCard';
import { TaskEditDialog } from './TaskEditDialog';
import type { Task } from '@/types';

interface TaskListProps {
  tasks?: Task[];
}

export const TaskList: React.FC<TaskListProps> = ({ tasks: propTasks }) => {
  const storeTasks = useTaskStore(state => state.tasks);
  const topics = useTopicStore(state => state.topics);
  const completeTask = useTaskStore(state => state.completeTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const deleteTask = useTaskStore(state => state.deleteTask);
  
  const tasks = propTasks || storeTasks;
  
  console.log('[TaskList] Rendering with tasks:', tasks.length, 'topics:', topics.length);
  console.log('[TaskList] Topics:', topics);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  const getTopic = (topicId?: string) => {
    if (!topicId) {
      console.log('[TaskList] getTopic: no topicId');
      return undefined;
    }
    const topic = topics.find(t => t.id === topicId);
    console.log('[TaskList] getTopic:', topicId, '-> found:', topic?.name);
    return topic;
  };
  
  const categorizeByTime = (tasks: Task[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const categories = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      later: [] as Task[],
      noDate: [] as Task[],
    };
    
    tasks.forEach(task => {
      if (!task.extractedDatetime) {
        categories.noDate.push(task);
        return;
      }
      
      const taskDate = new Date(task.extractedDatetime);
      if (isNaN(taskDate.getTime())) {
        categories.noDate.push(task);
        return;
      }
      
      const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      
      if (taskDate < now && taskDay.getTime() !== today.getTime()) {
        categories.overdue.push(task);
      } else if (taskDay.getTime() === today.getTime()) {
        categories.today.push(task);
      } else if (taskDay.getTime() === tomorrow.getTime()) {
        categories.tomorrow.push(task);
      } else if (taskDate < nextWeek) {
        categories.thisWeek.push(task);
      } else {
        categories.later.push(task);
      }
    });
    
    return categories;
  };
  
  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditOpen(true);
  };
  
  const handleSaveTask = (updatedTask: Task) => {
    updateTask(updatedTask);
  };
  
  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };
  
  const categorizedTasks = categorizeByTime(pendingTasks);
  
  const renderTaskSection = (title: string, tasks: Task[], color?: string) => {
    if (tasks.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h4 className={`text-xs font-medium mb-2 uppercase tracking-wider ${color || 'text-gray-500'}`}>
          {title} ({tasks.length})
        </h4>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                topic={getTopic(task.topicId)}
                onComplete={completeTask}
                onClick={handleTaskClick}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          待办 ({pendingTasks.length})
        </h3>
        
        {pendingTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无待办任务，点击下方输入框创建
          </div>
        ) : (
          <div>
            {renderTaskSection('已逾期', categorizedTasks.overdue, 'text-red-400')}
            {renderTaskSection('今天', categorizedTasks.today, 'text-accent')}
            {renderTaskSection('明天', categorizedTasks.tomorrow, 'text-accent-secondary')}
            {renderTaskSection('本周', categorizedTasks.thisWeek, 'text-yellow-400')}
            {renderTaskSection('稍后', categorizedTasks.later, 'text-gray-500')}
            {renderTaskSection('无日期', categorizedTasks.noDate, 'text-gray-600')}
          </div>
        )}
      </div>
      
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
            已完成 ({completedTasks.length})
          </h3>
          <div className="space-y-2 opacity-60">
            <AnimatePresence mode="popLayout">
              {completedTasks.slice(0, 5).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  topic={getTopic(task.topicId)}
                  onComplete={() => {}}
                  onClick={handleTaskClick}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      <TaskEditDialog
        task={editingTask}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};
