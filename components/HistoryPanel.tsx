import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Trash2, Clock, X, Copy, Share2, Check } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = async (item: HistoryItem) => {
    const text = `${item.expression} = ${item.result}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'OmniCalc Pro 計算結果',
          text: text,
        });
      } catch (err) {
        // Share cancelled or failed, fallback to copy
        handleCopy(text, item.id);
      }
    } else {
      handleCopy(text, item.id);
    }
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-700">
          <Clock size={20} />
          <h2 className="font-bold">計算履歴</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <p className="text-center text-slate-400 mt-10 text-sm">履歴はありません</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {item.mode}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-slate-600 font-mono break-all">{item.expression} =</div>
              <div className="text-lg font-bold text-slate-800 font-mono text-right break-all mb-2">{item.result}</div>
              
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={() => handleCopy(`${item.expression} = ${item.result}`, item.id)}
                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors flex items-center gap-1 text-xs"
                  title="コピー"
                >
                  {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === item.id ? 'コピー完了' : 'コピー'}
                </button>
                <button 
                  onClick={() => handleShare(item)}
                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                  title="共有"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="p-4 border-t bg-slate-50">
          <button 
            onClick={onClear}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            履歴を全消去
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;