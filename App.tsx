import React, { useState, useEffect } from 'react';
import { CalculatorMode, HistoryItem } from './types';
import { MODES, APP_NAME } from './constants';
import StandardCalculator from './components/calculators/StandardCalculator';
import RemainderCalculator from './components/calculators/RemainderCalculator';
import RoundingCalculator from './components/calculators/RoundingCalculator';
import DiscountCalculator from './components/calculators/DiscountCalculator';
import AdvancedDivisionCalculator from './components/calculators/AdvancedDivisionCalculator';
import UnitPriceCalculator from './components/calculators/UnitPriceCalculator';
import CombinatoricsCalculator from './components/calculators/CombinatoricsCalculator';
import IntegerToolsCalculator from './components/calculators/IntegerToolsCalculator';
import HistoryPanel from './components/HistoryPanel';
import UpdateModal from './components/UpdateModal';
import { History, Menu, Info } from 'lucide-react';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CalculatorMode>(CalculatorMode.STANDARD);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('omnicalc_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
    setIsUpdateModalOpen(true);
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('omnicalc_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const clearHistory = () => {
    if (confirm('履歴をすべて消去しますか？')) {
      setHistory([]);
    }
  };

  const renderCalculator = () => {
    switch (activeMode) {
      case CalculatorMode.STANDARD:
        return <StandardCalculator onAddToHistory={addToHistory} />;
      case CalculatorMode.ADVANCED_DIV:
        return <AdvancedDivisionCalculator onAddToHistory={addToHistory} />;
      case CalculatorMode.REMAINDER:
        return <RemainderCalculator onAddToHistory={addToHistory} />;
      case CalculatorMode.ROUNDING:
        return <RoundingCalculator onAddToHistory={addToHistory} />;
      case CalculatorMode.DISCOUNT:
        return <DiscountCalculator onAddToHistory={addToHistory} />;
      case CalculatorMode.UNIT_PRICE:
        return <UnitPriceCalculator onAddToHistory={addToHistory} />;
      case CalculatorMode.COMBINATORICS:
        return <CombinatoricsCalculator onAddToHistory={addToHistory} />;
      case CalculatorMode.INTEGER_TOOLS:
        return <IntegerToolsCalculator onAddToHistory={addToHistory} />;
      default:
        return <div className="text-center p-10 text-slate-400">準備中...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-600">
          <Menu />
        </button>
        <h1 className="font-bold text-lg text-slate-800">{APP_NAME}</h1>
        <button onClick={() => setIsHistoryOpen(true)} className="p-2 -mr-2 text-slate-600">
          <History />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out z-30
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              {APP_NAME}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Ver 1.5.0</p>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeMode === mode.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm">{mode.label}</div>
                  <div className="text-[10px] opacity-70">{mode.description}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <button 
            onClick={() => {
              setIsUpdateModalOpen(true);
              setIsSidebarOpen(false);
            }}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors w-full p-2"
          >
            <Info size={16} />
            更新情報・バージョン
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen relative">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          
          <div className="hidden md:flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {MODES.find(m => m.id === activeMode)?.label}
            </h2>
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow text-slate-600 text-sm font-medium transition-all"
            >
              <History size={18} />
              履歴を表示
            </button>
          </div>

          <div className="flex-1">
            {renderCalculator()}
          </div>
        </div>
      </main>

      {/* Modals & Panels */}
      <HistoryPanel 
        history={history} 
        onClear={clearHistory} 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
      
      <UpdateModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
      />

    </div>
  );
};

export default App;
