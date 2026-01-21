import React, { useState } from 'react';
import { roundToNearest } from '../../utils/mathUtils';
import { HistoryItem, CalculatorMode } from '../../types';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const RoundingCalculator: React.FC<Props> = ({ onAddToHistory }) => {
  const [inputVal, setInputVal] = useState('');
  const [nearest, setNearest] = useState('10');
  const [results, setResults] = useState<{ round: number; ceil: number; floor: number } | null>(null);

  const handleCalculate = () => {
    const val = parseFloat(inputVal);
    const n = parseFloat(nearest);
    if (isNaN(val) || isNaN(n) || n === 0) return;

    // Logic for nearest multiples
    const round = Math.round(val / n) * n;
    const ceil = Math.ceil(val / n) * n;
    const floor = Math.floor(val / n) * n;

    setResults({ round, ceil, floor });

    onAddToHistory({
      mode: CalculatorMode.ROUNDING,
      expression: `${inputVal} (基準: ${nearest})`,
      result: `四捨五入: ${round}`,
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-800 font-bold mb-4 text-center">概数（がいすう）・端数処理</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">対象の数値</label>
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="12345"
              className="w-full text-xl font-mono p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">丸める基準 (位)</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['0.1', '1', '10', '100', '1000', '10000'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setNearest(opt)}
                  className={`py-2 text-sm font-mono rounded-md border ${nearest === opt ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
               <span className="text-xs text-slate-400">カスタム:</span>
               <input 
                 type="number" 
                 value={nearest} 
                 onChange={(e) => setNearest(e.target.value)}
                 className="flex-1 p-2 border border-slate-200 rounded text-sm font-mono"
               />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!inputVal}
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all"
          >
            概数を計算
          </button>
        </div>
      </div>

      {results && (
        <div className="grid grid-cols-1 gap-3 animate-fade-in-up">
          <ResultCard title="四捨五入" value={results.round} icon={<Minus className="rotate-45" />} color="bg-brand-50 border-brand-200 text-brand-900" />
          <div className="grid grid-cols-2 gap-3">
             <ResultCard title="切り上げ" value={results.ceil} icon={<ArrowUp size={16} />} color="bg-white border-slate-200 text-slate-700" />
             <ResultCard title="切り捨て" value={results.floor} icon={<ArrowDown size={16} />} color="bg-white border-slate-200 text-slate-700" />
          </div>
        </div>
      )}
    </div>
  );
};

const ResultCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${color}`}>
    <div className="flex items-center gap-1 text-xs font-bold opacity-70 mb-1">
      {icon} {title}
    </div>
    <div className="text-2xl font-mono font-bold">
      {value.toLocaleString()}
    </div>
  </div>
);

export default RoundingCalculator;