import React, { useState } from 'react';
import { FileText, Download, Sparkles } from '@/components/ui/icons';

export const InsightPanel: React.FC = () => {
  const [reports] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const loadReport = async (filename: string) => {
    console.log('[InsightPanel] Loading report:', filename);
    setSelectedReport(filename);
  };
  
  return (
    <div className="glass-container p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-gray-300" size={24} />
          洞察报告
        </h2>
        <button className="glass-button flex items-center gap-2">
          <Download size={16} />
          导出全部
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-2">
          {reports.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>暂无报告</p>
              <p className="text-sm mt-2">每日 21:00 自动生成</p>
            </div>
          )}
          {reports.map((report) => (
            <button
              key={report}
              onClick={() => loadReport(report)}
              className={`w-full glass-button text-left ${
                selectedReport === report ? 'bg-glass-highlight border-glass-borderHover' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <span className="truncate">{report}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="col-span-2 glass-surface p-4 min-h-[400px]">
          {selectedReport ? (
            <div className="text-white">
              <p>报告内容加载中：{selectedReport}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>选择报告查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
