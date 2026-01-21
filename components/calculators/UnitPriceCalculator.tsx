import React, { useState } from 'react';
import { formatNumber } from '../../utils/mathUtils';
import { HistoryItem, CalculatorMode } from '../../types';
import { ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const UnitPriceCalculator: React.FC<Props> = ({ onAddToHistory }) => {
  const [priceA, setPriceA] = useState('');
  const [amountA, setAmountA] = useState('');
  const [priceB, setPriceB] = useState('');
  const [amountB, setAmountB] = useState('');

  const [result, setResult] = useState<{ unitA: number; unitB: number; winner: 'A' | 'B' | 'Equal' } | null>(null);

  const handleCalculate = () => {
    const pA = parseFloat(priceA);
    const aA = parseFloat(amountA);
    const pB = parseFloat(priceB);
    const aB = parseFloat(amountB);

    if (isNaN(pA) || isNaN(aA) || isNaN(pB) || isNaN(aB) || aA === 0 || aB === 0) return;

    const unitA = pA / aA;
    const unitB = pB / aB;

    let winner: 'A' | 'B' | 'Equal' = 'Equal';
    if (unitA < unitB) winner = 'A';
    if (unitB < unitA) winner = 'B';

    setResult({ unitA, unitB, winner });

    let resultText = '';
    if (winner === 'Equal') resultText = 'どちらも同じ単価';
    else resultText = `${winner === 'A' ? 'A' : 'B'}の方がお得`;

    onAddToHistory({
      mode: CalculatorMode.UNIT_PRICE,
      expression: `A(${pA}円/${aA}) vs B(${pB}円/${aB})`,
      result: resultText,
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-slate-800 font-bold flex items-center justify-center gap-2">
           <ShoppingBag size={20} className="text-brand-500"/> どちらが得？ (単価比較)
        </h3>
        <p className="text-xs text-slate-500 mt-1">価格と量(g, ml, 個など)を入力して比較</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Item A */}
        <div className={`p-4 rounded-xl border-2 transition-colors ${result?.winner === 'A' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>
          <div className="text-center font-bold text-brand-700 mb-2">商品 A</div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-400 block">価格 (円)</label>
              <input type="number" value={priceA} onChange={e => setPriceA(e.target.value)} className="w-full p-2 rounded border border-slate-200 text-right font-mono"/>
            </div>
            <div>
              <label className="text-xs text-slate-400 block">量</label>
              <input type="number" value={amountA} onChange={e => setAmountA(e.target.value)} className="w-full p-2 rounded border border-slate-200 text-right font-mono"/>
            </div>
          </div>
          {result && (
             <div className="mt-3 pt-3 border-t border-slate-200/50 text-center">
               <div className="text-xs text-slate-500">単価</div>
               <div className="font-mono font-bold text-lg">{formatNumber(result.unitA, 2)}</div>
             </div>
          )}
        </div>

        {/* Item B */}
        <div className={`p-4 rounded-xl border-2 transition-colors ${result?.winner === 'B' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>
          <div className="text-center font-bold text-orange-600 mb-2">商品 B</div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-400 block">価格 (円)</label>
              <input type="number" value={priceB} onChange={e => setPriceB(e.target.value)} className="w-full p-2 rounded border border-slate-200 text-right font-mono"/>
            </div>
            <div>
              <label className="text-xs text-slate-400 block">量</label>
              <input type="number" value={amountB} onChange={e => setAmountB(e.target.value)} className="w-full p-2 rounded border border-slate-200 text-right font-mono"/>
            </div>
          </div>
          {result && (
             <div className="mt-3 pt-3 border-t border-slate-200/50 text-center">
               <div className="text-xs text-slate-500">単価</div>
               <div className="font-mono font-bold text-lg">{formatNumber(result.unitB, 2)}</div>
             </div>
          )}
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg"
      >
        比較する
      </button>

      {result && result.winner !== 'Equal' && (
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-4 rounded-xl text-white shadow-lg animate-fade-in-up text-center">
           <div className="flex items-center justify-center gap-2 font-bold text-xl mb-1">
             <CheckCircle2 />
             商品 {result.winner} の方がお得！
           </div>
           <p className="text-sm text-brand-100 opacity-90">
             単価が約 <span className="font-mono font-bold text-lg">{formatNumber(Math.abs(result.unitA - result.unitB), 3)}</span> 円安いです
           </p>
        </div>
      )}
    </div>
  );
};

export default UnitPriceCalculator;