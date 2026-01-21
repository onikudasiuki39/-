import React, { useState } from 'react';
import { gcd, lcm, primeFactorization, formatPrimeFactors } from '../../utils/mathUtils';
import { HistoryItem, CalculatorMode } from '../../types';
import { Split, ArrowDownUp } from 'lucide-react';

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const IntegerToolsCalculator: React.FC<Props> = ({ onAddToHistory }) => {
  const [numA, setNumA] = useState('');
  const [numB, setNumB] = useState('');
  const [result, setResult] = useState<{ gcdVal: number; lcmVal: number; factorsA: string; factorsB: string } | null>(null);

  const handleCalculate = () => {
    const a = parseInt(numA, 10);
    const b = parseInt(numB, 10);

    if (isNaN(a)) return; // Need at least A
    const validB = isNaN(b) ? a : b; // If B is empty, treat as single number analysis for factors

    const gcdVal = gcd(a, validB);
    const lcmVal = lcm(a, validB);
    
    // Prime Factorization with safety check
    const rawFactorsA = primeFactorization(a);
    const factorsA = rawFactorsA ? formatPrimeFactors(rawFactorsA) : "桁数過多(計算不可)";

    const rawFactorsB = primeFactorization(validB);
    const factorsB = rawFactorsB ? formatPrimeFactors(rawFactorsB) : "桁数過多(計算不可)";

    setResult({ gcdVal, lcmVal, factorsA, factorsB });

    const expression = numB ? `GCD/LCM(${a}, ${b})` : `素因数(${a})`;
    const resText = numB 
      ? `最大公約数:${gcdVal}, 最小公倍数:${lcmVal}`
      : `素因数: ${factorsA}`;

    onAddToHistory({
      mode: CalculatorMode.INTEGER_TOOLS,
      expression: expression,
      result: resText,
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-700 font-bold">
          <Split size={20} className="text-brand-500" />
          <span>約数・倍数・素因数分解</span>
        </div>
        
        <p className="text-xs text-slate-500 text-center mb-6">
          分数の約分や通分、素因数分解の答え合わせに。<br/>
          数字を1つだけ入力すると、その数の素因数のみ表示します。
        </p>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <input
              type="number"
              value={numA}
              onChange={(e) => setNumA(e.target.value)}
              placeholder="数値 A"
              className="w-full text-xl font-mono text-center p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-sm"
            />
          </div>
          <div className="text-slate-300 font-light">&</div>
          <div className="flex-1">
            <input
              type="number"
              value={numB}
              onChange={(e) => setNumB(e.target.value)}
              placeholder="数値 B (任意)"
              className="w-full text-xl font-mono text-center p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!numA}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-50"
        >
          解析する
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-fade-in-up">
          
          {/* Prime Factors */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
               <Split size={14} /> 素因数分解
             </h4>
             <div className="space-y-2">
               <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                 <span className="font-mono font-bold text-slate-700">{numA}</span>
                 <span className={`font-mono font-medium ${result.factorsA.includes('過多') ? 'text-red-500 text-xs' : 'text-brand-600'}`}>{result.factorsA}</span>
               </div>
               {numB && (
                 <div className="flex justify-between items-center">
                   <span className="font-mono font-bold text-slate-700">{numB}</span>
                   <span className={`font-mono font-medium ${result.factorsB.includes('過多') ? 'text-red-500 text-xs' : 'text-brand-600'}`}>{result.factorsB}</span>
                 </div>
               )}
             </div>
          </div>

          {/* GCD / LCM (Only if B is present) */}
          {numB && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 flex flex-col items-center">
                <div className="text-xs text-brand-600 font-bold mb-1">最大公約数</div>
                <div className="text-[10px] text-brand-400 mb-1">(約分に使います)</div>
                <div className="text-3xl font-mono font-bold text-brand-700">{result.gcdVal}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col items-center">
                <div className="text-xs text-orange-600 font-bold mb-1">最小公倍数</div>
                <div className="text-[10px] text-orange-400 mb-1">(通分に使います)</div>
                <div className="text-3xl font-mono font-bold text-orange-700">{result.lcmVal}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntegerToolsCalculator;