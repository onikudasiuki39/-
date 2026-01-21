import React, { useState } from 'react';
import { calculateRemainder } from '../../utils/mathUtils';
import { HistoryItem, CalculatorMode } from '../../types';

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const RemainderCalculator: React.FC<Props> = ({ onAddToHistory }) => {
  const [dividend, setDividend] = useState('');
  const [divisor, setDivisor] = useState('');
  const [result, setResult] = useState<{ quotient: string; remainder: string } | null>(null);

  const handleCalculate = () => {
    const res = calculateRemainder(dividend, divisor);
    if (res) {
      setResult(res);
      onAddToHistory({
        mode: CalculatorMode.REMAINDER,
        expression: `${dividend} ÷ ${divisor}`,
        result: `${res.quotient} あまり ${res.remainder}`,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCalculate();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100">
        <h3 className="text-brand-800 font-bold mb-4 text-center">割り算とあまり（小数対応）</h3>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-brand-600 mb-1 ml-1">割られる数</label>
            <input
              type="number"
              value={dividend}
              onChange={(e) => setDividend(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例: 10.5"
              step="any"
              className="w-full text-xl font-mono p-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div className="text-2xl text-brand-400 font-light mt-6">÷</div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-brand-600 mb-1 ml-1">割る数</label>
            <input
              type="number"
              value={divisor}
              onChange={(e) => setDivisor(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例: 0.2"
              step="any"
              className="w-full text-xl font-mono p-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!dividend || !divisor}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-200"
        >
          計算する
        </button>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 animate-fade-in-up">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">答え</div>
          <div className="flex items-baseline gap-4 justify-center">
            <div className="text-center">
              <span className="text-5xl font-bold text-slate-800 font-mono">{result.quotient}</span>
              <span className="block text-xs text-slate-400 mt-1">商 (答え)</span>
            </div>
            <span className="text-xl text-slate-300">...</span>
            <div className="text-center">
              <span className="text-4xl font-bold text-brand-600 font-mono">{result.remainder}</span>
              <span className="block text-xs text-brand-400 mt-1">あまり</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-50 text-center text-slate-500 text-sm font-mono flex items-center justify-center gap-2">
             {dividend} = {divisor} × {result.quotient} + {result.remainder}
          </div>
        </div>
      )}
      
      <div className="text-center text-xs text-slate-400 mt-8">
        ※ 独自の計算エンジンにより、小数でも正確な商とあまりを算出します。
      </div>
    </div>
  );
};

export default RemainderCalculator;