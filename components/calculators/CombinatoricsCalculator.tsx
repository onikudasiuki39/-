import React, { useState } from 'react';
import { combinations, permutations, factorial, formatNumber } from '../../utils/mathUtils';
import { HistoryItem, CalculatorMode } from '../../types';
import { Network, ArrowRight } from 'lucide-react';

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const CombinatoricsCalculator: React.FC<Props> = ({ onAddToHistory }) => {
  const [n, setN] = useState('');
  const [r, setR] = useState('');
  const [result, setResult] = useState<{ nCr: number; nPr: number; fact: number } | null>(null);

  const handleCalculate = () => {
    const nVal = parseInt(n, 10);
    const rVal = parseInt(r, 10);

    if (isNaN(nVal) || isNaN(rVal) || nVal < 0 || rVal < 0) return;

    const nCr = combinations(nVal, rVal);
    const nPr = permutations(nVal, rVal);
    const fact = factorial(nVal);

    setResult({ nCr, nPr, fact });

    onAddToHistory({
      mode: CalculatorMode.COMBINATORICS,
      expression: `n=${nVal}, r=${rVal}`,
      result: `C=${formatNumber(nCr)}, P=${formatNumber(nPr)}`,
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-700 font-bold">
          <Network size={20} className="text-brand-500" />
          <span>順列・組み合わせ</span>
        </div>
        
        <p className="text-xs text-slate-500 text-center mb-6">
          「5人から2人選ぶ」などの計算に使います。<br/>
          n = 全体の数, r = 選ぶ数
        </p>

        <div className="flex items-end gap-3 justify-center mb-6">
          <div className="w-24">
            <label className="block text-xs font-bold text-center text-slate-400 mb-1">全体 (n)</label>
            <input
              type="number"
              value={n}
              onChange={(e) => setN(e.target.value)}
              placeholder="5"
              className="w-full text-2xl font-mono text-center p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div className="text-xl font-bold text-slate-300 pb-4">C / P</div>
          <div className="w-24">
            <label className="block text-xs font-bold text-center text-slate-400 mb-1">選ぶ (r)</label>
            <input
              type="number"
              value={r}
              onChange={(e) => setR(e.target.value)}
              placeholder="2"
              className="w-full text-2xl font-mono text-center p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!n || !r}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-50"
        >
          計算する
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Combinations Result */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10 font-bold text-6xl select-none">C</div>
            <div className="text-xs text-slate-400 font-bold mb-1">組み合わせ (順番関係なし)</div>
            <div className="text-sm text-slate-300 mb-2 font-mono">
              {n}C{r} =
            </div>
            <div className="text-4xl font-mono font-bold">{formatNumber(result.nCr)}</div>
            <div className="text-right text-xs text-brand-300 mt-2">通り</div>
          </div>

          {/* Permutations Result */}
          <div className="bg-white text-slate-800 p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-slate-100 font-bold text-6xl select-none">P</div>
             <div className="text-xs text-slate-500 font-bold mb-1">順列 (並べる順番あり)</div>
            <div className="text-sm text-slate-400 mb-2 font-mono">
              {n}P{r} =
            </div>
            <div className="text-3xl font-mono font-bold text-slate-700">{formatNumber(result.nPr)}</div>
             <div className="text-right text-xs text-slate-400 mt-2">通り</div>
          </div>
          
           {/* Factorial Result (if r is distinct) */}
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">参考: {n}の階乗 ({n}!)</span>
              <span className="font-mono font-bold text-slate-700">
                {result.fact > 1e15 ? result.fact.toExponential(4) : formatNumber(result.fact)}
              </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default CombinatoricsCalculator;
