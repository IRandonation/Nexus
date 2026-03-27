import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Key, Bell, Database, Palette } from '@/components/ui/icons';

export const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [saveStatus, setSaveStatus] = useState('');
  
  useEffect(() => {
    loadApiKey();
  }, []);
  
  const loadApiKey = async () => {
    try {
      const key = await invoke<string>('load_api_key');
      setApiKey(key);
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };
  
  const saveSettings = async () => {
    try {
      await invoke('save_api_key', { apiKey });
      setSaveStatus('保存成功！请重启应用以使用新的 API Key');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save API key:', error);
      setSaveStatus('保存失败');
    }
  };
  
  return (
    <div className="glass-container p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6">设置</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Key size={16} />
            DeepSeek API
          </h3>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入 DeepSeek API Key"
            className="glass-input glass-container px-4 py-3 w-full"
          />
          <p className="text-xs text-gray-500 mt-2">
            API Key 仅存储在本地，不会上传到任何服务器
          </p>
          {saveStatus && (
            <p className="text-xs text-accent mt-2">{saveStatus}</p>
          )}
        </section>
        
        <section>
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Bell size={16} />
            通知
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded border-gray-500 accent-accent"
            />
            <span className="text-white">启用任务提醒通知</span>
          </label>
        </section>
        
        <section>
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Palette size={16} />
            外观
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('dark')}
              className={`glass-button ${theme === 'dark' ? 'bg-accent/20 border-accent/30' : ''}`}
            >
              深色
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`glass-button ${theme === 'light' ? 'bg-accent/20 border-accent/30' : ''}`}
            >
              浅色
            </button>
          </div>
        </section>
        
        <section>
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Database size={16} />
            数据
          </h3>
          <div className="flex gap-2">
            <button className="glass-button text-red-400 hover:text-red-300">
              清除所有数据
            </button>
            <button className="glass-button">
              导出数据
            </button>
          </div>
        </section>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveSettings}
          className="glass-button bg-accent/20 hover:bg-accent/30 border-accent/30"
        >
          保存设置
        </button>
      </div>
    </div>
  );
};
