import React, { useState } from 'react';
import { calculatePercentage, formatNumber } from '../../utils/mathUtils';
import { HistoryItem, CalculatorMode } from '../../types';
import { Tag, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const DiscountCalculator: React.FC<Props> = ({ onAddToHistory }) => {
  const [amount, setAmount] = useState('');
  const [percent, setPercent] = useState('');
  const [isDiscount, setIsDiscount] = useState(true); // true = discount, false = tax/increase
  const [result, setResult] = useState<{ finalAmount: number; diff: number } | null>(null);

  const handleCalculate = () => {
    const amt = parseFloat(amount);
    const pct = parseFloat(percent);

    if (isNaN(amt) || isNaN(pct)) return;

    const res = calculatePercentage(amt, pct, isDiscount);
    setResult(res);

    const typeStr = isDiscount ? '割引' : '上乗せ(税)';
    const operator = isDiscount ? 'OFF' : 'UP';

    onAddToHistory({
      mode: CalculatorMode.DISCOUNT,
      expression: `${formatNumber(amt)}円 の ${pct}% ${operator}`,
      result: `${formatNumber(res.finalAmount)}円`,
    });
  };

  const presetPercentages = [5, 8, 10, 15, 20, 30, 50];

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => { setIsDiscount(true); setResult(null); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                isDiscount ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingDown size={16} /> 割引 (OFF)
            </button>
            <button
              onClick={() => { setIsDiscount(false); setResult(null); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                !isDiscount ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp size={16} /> 税込/増 (UP)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">元の金額 (円)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="例: 1980"
              className="w-full text-2xl font-mono p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              {isDiscount ? '割引率 (%)' : '税率・上乗せ率 (%)'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="10"
                className="flex-1 text-xl font-mono p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {presetPercentages.map((p) => (
                <button
                  key={p}
                  onClick={() => setPercent(p.toString())}
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${
                    percent === p.toString() 
                      ? 'bg-brand-100 text-brand-700 border-brand-300' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!amount || !percent}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
              isDiscount 
                ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-200' 
                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
            }`}
          >
            計算する
          </button>
        </div>
      </div>

      {result && (
        <div className="animate-fade-in-up space-y-3">
          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
             {/* Background decoration */}
             <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${isDiscount ? 'bg-brand-400' : 'bg-orange-400'}`}></div>
             
             <div className="relative z-10">
               <div className="text-sm opacity-70 mb-1">{isDiscount ? '計算後価格' : '税込/加算後価格'}</div>
               <div className="text-4xl font-mono font-bold tracking-tight">
                 {formatNumber(result.finalAmount)}
                 <span className="text-base ml-1 font-normal opacity-60">円</span>
               </div>
               
               <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                 <div className="text-sm">
                   {isDiscount ? 'お得になった金額:' : '税金・上乗せ分:'}
                 </div>
                 <div className="font-mono text-xl font-bold text-brand-200">
                   {isDiscount ? '-' : '+'}{formatNumber(result.diff)}円
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCalculator;