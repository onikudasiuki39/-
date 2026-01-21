import React from 'react';
import { VERSION_HISTORY, APP_NAME } from '../constants';
import { X, Info } from 'lucide-react';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-brand-500 to-brand-600 text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Info className="animate-pulse" />
              {APP_NAME} 更新情報
            </h2>
            <p className="text-brand-100 text-sm mt-1">最新の機能追加と改善履歴</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-8">
            {VERSION_HISTORY.map((log, index) => (
              <div key={log.version} className="relative pl-6 border-l-2 border-slate-200">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-brand-500' : 'bg-slate-300'}`}></div>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800">{log.version}</h3>
                  <span className="text-xs text-slate-500 font-mono">{log.date}</span>
                </div>
                <ul className="space-y-2">
                  {log.changes.map((change, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-slate-400 shrink-0"></span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;