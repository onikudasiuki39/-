import React, { useState } from 'react';
import { applyAdvancedRounding, formatNumber, stripPrecisionError, calculateRemainder } from '../../utils/mathUtils';
import { HistoryItem, CalculatorMode } from '../../types';
import { Scaling, Settings2, Check } from 'lucide-react';

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const AdvancedDivisionCalculator: React.FC<Props> = ({ onAddToHistory }) => {
  const [dividend, setDividend] = useState('');
  const [divisor, setDivisor] = useState('');
  const [method, setMethod] = useState<'round' | 'ceil' | 'floor'>('round');
  const [decimalPlace, setDecimalPlace] = useState<number>(1); // 1 = 0.1 place
  const [calcRemainder, setCalcRemainder] = useState(false);

  const [result, setResult] = useState<{ raw: number; processed: number; remainder?: string } | null>(null);

  const handleCalculate = () => {
    const a = parseFloat(dividend);
    const b = parseFloat(divisor);

    if (isNaN(a) || isNaN(b) || b === 0) return;

    // Standard Division & Rounding (for the main big display)
    const raw = stripPrecisionError(a / b);
    const processed = applyAdvancedRounding(raw, decimalPlace, method);

    // Remainder Calculation (if enabled)
    // IMPORTANT: Remainder is calculated based on the precision.
    // Logic: Remainder corresponds to the quotient floor-truncated to 'decimalPlace'.
    let remainderStr: string | undefined = undefined;
    if (calcRemainder) {
      const remResult = calculateRemainder(dividend, divisor, decimalPlace);
      if (remResult) {
        remainderStr = remResult.remainder;
      }
    }

    setResult({ raw, processed, remainder: remainderStr });

    const methodMap = { round: '四捨五入', ceil: '切り上げ', floor: '切り捨て' };
    const placeMap: Record<number, string> = { 0: '整数', 1: '小数第1位', 2: '小数第2位', 3: '小数第3位' };
    const placeStr = placeMap[decimalPlace] || `小数第${decimalPlace}位`;
    
    const remainderHistory = remainderStr ? ` (あまり ${remainderStr})` : '';

    onAddToHistory({
      mode: CalculatorMode.ADVANCED_DIV,
      expression: `${a} ÷ ${b} (${placeStr}で${methodMap[method]})`,
      result: `${formatNumber(processed, decimalPlace)}${remainderHistory}`,
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      
      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-center gap-2 text-slate-700 font-bold">
          <Scaling size={20} className="text-brand-500"/>
          <span>割り算・概数</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Numbers Input */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="number"
                value={dividend}
                onChange={(e) => setDividend(e.target.value)}
                placeholder="割られる数"
                step="any"
                className="w-full text-xl font-mono text-center p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-sm"
              />
            </div>
            <div className="text-xl text-slate-300 font-light">÷</div>
            <div className="flex-1">
              <input
                type="number"
                value={divisor}
                onChange={(e) => setDivisor(e.target.value)}
                placeholder="割る数"
                step="any"
                className="w-full text-xl font-mono text-center p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-sm"
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
              <Settings2 size={14} /> 計算設定
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 ml-1">処理方法</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="round">四捨五入</option>
                  <option value="ceil">切り上げ</option>
                  <option value="floor">切り捨て</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 ml-1">求める位</label>
                <select 
                  value={decimalPlace}
                  onChange={(e) => setDecimalPlace(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="0">整数 (1の位)</option>
                  <option value="1">小数第1位 (0.1)</option>
                  <option value="2">小数第2位 (0.01)</option>
                  <option value="3">小数第3位 (0.001)</option>
                </select>
              </div>
            </div>

            {/* Remainder Toggle */}
            <div 
              onClick={() => setCalcRemainder(!calcRemainder)}
              className="flex items-center gap-3 cursor-pointer group select-none pt-2"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${calcRemainder ? 'bg-brand-500 border-brand-500' : 'bg-white border-slate-300'}`}>
                {calcRemainder && <Check size={14} className="text-white" />}
              </div>
              <span className={`text-sm transition-colors ${calcRemainder ? 'text-brand-700 font-bold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                あまりも出すかどうか
              </span>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!dividend || !divisor}
            className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            計算する
          </button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-slate-900 rounded-2xl text-white shadow-xl animate-fade-in-up overflow-hidden">
           <div className="p-6">
             <div className="flex items-center justify-between text-slate-400 text-xs mb-4">
               <span>正確な商</span>
               <span className="font-mono bg-slate-800 px-2 py-1 rounded">{result.raw.toString()}</span>
             </div>
             
             <div className="text-center">
               <div className="text-xs text-brand-300 font-bold mb-2 uppercase tracking-widest">RESULT</div>
               <div className="text-5xl font-mono font-bold tracking-tight text-white mb-1">
                 {formatNumber(result.processed, decimalPlace)}
               </div>
               <div className="text-sm text-slate-400 font-medium">概数 (答え)</div>
             </div>
           </div>

           {/* Remainder Display */}
           {result.remainder !== undefined && (
             <div className="bg-slate-800/50 border-t border-slate-700 p-4 flex items-center justify-center gap-4 animate-fade-in">
               <span className="text-sm text-slate-400 font-bold">あまり</span>
               <span className="text-2xl font-mono text-brand-200 font-bold">{result.remainder}</span>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AdvancedDivisionCalculator;