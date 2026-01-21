import React, { useState } from 'react';
import { accurateRound, formatNumber, safeEvaluate } from '../../utils/mathUtils';
import { HistoryItem, CalculatorMode } from '../../types';
import { Delete, Equal } from 'lucide-react';

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const StandardCalculator: React.FC<Props> = ({ onAddToHistory }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [roundingDecimal, setRoundingDecimal] = useState<number | 'none'>('none');
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const handleNumber = (num: string) => {
    if (shouldResetDisplay) {
      if (num === '.') {
        setDisplay('0.');
      } else {
        setDisplay(num);
      }
      setShouldResetDisplay(false);
      return;
    }

    if (num === '.') {
      if (display.includes('.')) return; // Prevent multiple decimals
    }

    if (display === '0' && num !== '.') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setShouldResetDisplay(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleCalculate = () => {
    if (!equation && !shouldResetDisplay) return;
    
    // If repeat equals (no equation but valid display), do nothing or implement repeat logic.
    // Here we strictly follow: Equation + Display = Result.
    if (!equation) return;

    const fullExpression = equation + display;
    // Replace visual operators with JS operators
    const jsExpression = fullExpression.replace('×', '*').replace('÷', '/');
    
    // safeEvaluate now includes stripPrecisionError for robust results (e.g. 0.1+0.2=0.3)
    let result = safeEvaluate(jsExpression);

    if (isNaN(result) || !isFinite(result)) {
      setDisplay('Error');
      setShouldResetDisplay(true);
      return;
    }

    // Apply rounding preference
    if (typeof roundingDecimal === 'number') {
      result = accurateRound(result, roundingDecimal);
    }

    // formatNumber also applies precision stripping
    const resultStr = formatNumber(result, roundingDecimal === 'none' ? 10 : roundingDecimal);

    setDisplay(resultStr.replace(/,/g, '')); // Keep internal display clean for next calc
    setEquation('');
    setShouldResetDisplay(true);

    onAddToHistory({
      mode: CalculatorMode.STANDARD,
      expression: fullExpression,
      result: resultStr,
    });
  };

  const buttons = [
    '7', '8', '9', '÷',
    '4', '5', '6', '×',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];

  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      {/* Display */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-4 shadow-inner text-right">
        <div className="text-slate-400 text-sm h-6 mb-1 font-mono">{equation}</div>
        <div className="text-white text-4xl font-bold font-mono tracking-wider overflow-x-auto whitespace-nowrap scrollbar-hide">
          {display}
        </div>
      </div>

      {/* Settings Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">端数処理:</span>
        <select 
          value={roundingDecimal === 'none' ? 'none' : roundingDecimal}
          onChange={(e) => setRoundingDecimal(e.target.value === 'none' ? 'none' : Number(e.target.value))}
          className="text-sm bg-slate-50 border-slate-200 border rounded px-2 py-1 text-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="none">指定なし（最大精度）</option>
          <option value="0">整数（小数第1位四捨五入）</option>
          <option value="1">小数第1位まで（第2位四捨五入）</option>
          <option value="2">小数第2位まで（第3位四捨五入）</option>
          <option value="3">小数第3位まで（第4位四捨五入）</option>
        </select>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3">
        <button onClick={handleClear} className="col-span-3 bg-slate-200 text-slate-800 p-4 rounded-xl font-bold text-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">
          AC
        </button>
        <button onClick={() => setDisplay(prev => prev.slice(0, -1) || '0')} className="bg-slate-200 text-slate-800 p-4 rounded-xl font-bold text-lg hover:bg-slate-300 transition-colors flex items-center justify-center">
          <Delete size={20} />
        </button>

        {buttons.map((btn) => {
          const isOperator = ['+', '-', '×', '÷', '='].includes(btn);
          const isEquals = btn === '=';
          
          return (
            <button
              key={btn}
              onClick={() => {
                if (btn === '=') handleCalculate();
                else if (['+', '-', '×', '÷'].includes(btn)) handleOperator(btn);
                else handleNumber(btn);
              }}
              className={`
                p-4 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-sm
                ${isEquals 
                  ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200' 
                  : isOperator 
                    ? 'bg-brand-50 text-brand-600 hover:bg-brand-100' 
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'}
              `}
            >
              {isEquals ? <Equal size={24} /> : btn}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StandardCalculator;