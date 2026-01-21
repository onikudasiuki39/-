/**
 * Removes standard floating point errors (e.g., 0.30000000000000004 -> 0.3)
 * Uses 14 digits of precision which is safe for standard double operations.
 */
export const stripPrecisionError = (num: number): number => {
  if (!isFinite(num)) return num;
  return parseFloat(num.toPrecision(14));
};

/**
 * Helper: Normalizes a number string, expanding scientific notation if present.
 * e.g., "1.2e+5" -> "120000"
 */
export const normalizeNumberString = (str: string): string => {
  if (!str) return "0";
  // If it's standard notation, return as is
  if (!str.toLowerCase().includes('e')) return str;
  
  const num = parseFloat(str);
  if (isNaN(num)) return "0";
  
  // Convert to fixed string with high precision to capture digits, then trim
  // 20 digits is usually sufficient for safe integer range inputs in this app context.
  let expanded = num.toFixed(20); 
  if (expanded.includes('.')) {
    expanded = expanded.replace(/\.?0+$/, "");
  }
  return expanded;
};

/**
 * Formats a number to a specific decimal place.
 * Uses string manipulation to avoid floating point artifacts.
 * Handles Infinity as "桁オーバー".
 */
export const formatNumber = (num: number, maximumFractionDigits: number = 10): string => {
  if (!isFinite(num)) {
    if (isNaN(num)) return "Error";
    return "桁オーバー";
  }
  const cleanNum = stripPrecisionError(num);
  return new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits,
    useGrouping: true,
  }).format(cleanNum);
};

/**
 * Rounds a number to a specific decimal place using a correction factor.
 */
export const accurateRound = (value: number, decimals: number): number => {
  const cleanValue = stripPrecisionError(value);
  const factor = Math.pow(10, decimals);
  return stripPrecisionError(Math.round((cleanValue + Number.EPSILON) * factor) / factor);
};

/**
 * Applies various rounding methods to a specific decimal place.
 * Handles floating point precision issues by pre-rounding to a high precision
 * before applying floor/ceil.
 */
export const applyAdvancedRounding = (value: number, decimals: number, method: 'round' | 'ceil' | 'floor'): number => {
  const factor = Math.pow(10, decimals);
  
  // Clean up floating point noise (e.g. 2.99999999994) before flooring/ceiling
  const cleanVal = stripPrecisionError(value * factor);

  switch (method) {
    case 'round': return stripPrecisionError(Math.round(cleanVal) / factor);
    case 'ceil': return stripPrecisionError(Math.ceil(cleanVal) / factor);
    case 'floor': return stripPrecisionError(Math.floor(cleanVal) / factor);
  }
};

/**
 * Calculates division with remainder for decimals, supporting specific precision.
 * 
 * Logic:
 * 1. Scale inputs to BigInt to remove decimal points.
 * 2. Calculate the quotient up to the requested `decimals` precision (using floor logic).
 * 3. Calculate remainder based on that quotient.
 * 
 * Example: 9.2 / 4, decimals=1
 * A=92, B=40. Target Precision P=1.
 * We want floor(9.2 / 4 * 10^1) / 10^1 = 2.3.
 * Remainder = 9.2 - 4 * 2.3 = 0.
 * 
 * @param dividendStr Numerator
 * @param divisorStr Denominator
 * @param decimals Target decimal places for the Quotient. Default 0 (Integer division).
 */
export const calculateRemainder = (dividendStr: string, divisorStr: string, decimals: number = 0): { quotient: string; remainder: string } | null => {
  try {
    // Normalize inputs (handle 1.2e+5 etc.)
    const normDivA = normalizeNumberString(dividendStr);
    const normDivB = normalizeNumberString(divisorStr);

    if (!normDivA || !normDivB) return null;

    // Helper: count decimals
    const getDecimals = (s: string) => {
      // s is already normalized (no 'e')
      const parts = s.split('.');
      return parts.length > 1 ? parts[1].length : 0;
    };

    const d1 = getDecimals(normDivA);
    const d2 = getDecimals(normDivB);
    const D = Math.max(d1, d2); // Base scale needed to integer-ize inputs

    // Helper: scale float string to BigInt
    const toScaledBigInt = (str: string, targetDecimals: number): bigint => {
      const parts = str.split('.');
      const integerPart = parts[0];
      const fractionalPart = (parts[1] || '').padEnd(targetDecimals, '0');
      
      // BigInt cannot parse "1.0", so we construct the integer string manually
      // Handling negative sign implicitly by concatenation, but need care if 0 padding
      // Actually simpler: remove dot and parse.
      // E.g. "-1.2", target 2 decimals -> "-120"
      
      // If original string was just "-" or empty, handle? Assume valid number str from normalize.
      return BigInt(integerPart + fractionalPart);
    };

    const A = toScaledBigInt(normDivA, D);
    const B = toScaledBigInt(normDivB, D);

    if (B === 0n) return null;

    // We want to calculate Q such that it has `decimals` (P) precision.
    // Q_int = floor( (A/B) * 10^P ).
    // Calculation: (A * 10^P) / B
    // Mod = (A * 10^P) % B
    
    // Note: decimals (P) must be >= 0.
    const P = Math.max(0, Math.floor(decimals));
    const scalingFactor = BigInt(10) ** BigInt(P);
    
    const A_prime = A * scalingFactor;
    
    const Q_int = A_prime / B;
    const Mod = A_prime % B;

    // Formatting Quotient
    // Q_int is the quotient scaled by 10^P.
    // e.g. 23 with P=1 -> 2.3
    let qStr = Q_int.toString();
    if (P > 0) {
      const isNeg = qStr.startsWith('-');
      const rawDigits = isNeg ? qStr.slice(1) : qStr;
      
      // If absolute value is smaller than 10^P, we need leading zeros.
      // e.g. raw "3", P=1 -> "03" -> "0.3"
      const neededPadding = P + 1 - rawDigits.length;
      const padded = (neededPadding > 0 ? '0'.repeat(neededPadding) : '') + rawDigits;
      
      const dotPos = padded.length - P;
      qStr = (isNeg ? '-' : '') + padded.slice(0, dotPos) + '.' + padded.slice(dotPos);
    }

    // Formatting Remainder
    // Remainder r = Mod * 10^{-(D+P)}
    // So we need to format 'Mod' with (D + P) decimal places.
    let rStr = Mod.toString();
    const totalDecimals = D + P;
    
    if (totalDecimals > 0) {
      const isNegR = rStr.startsWith('-');
      const rawR = isNegR ? rStr.slice(1) : rStr;
      
      const neededPaddingR = totalDecimals + 1 - rawR.length;
      const paddedR = (neededPaddingR > 0 ? '0'.repeat(neededPaddingR) : '') + rawR;
      
      const dotPosR = paddedR.length - totalDecimals;
      rStr = (isNegR ? '-' : '') + paddedR.slice(0, dotPosR) + '.' + paddedR.slice(dotPosR);
    }

    // Clean up trailing zeros and dot
    const cleanFloatStr = (s: string) => {
      if (!s.includes('.')) return s;
      return s.replace(/\.?0+$/, '');
    };

    return {
      quotient: cleanFloatStr(qStr),
      remainder: cleanFloatStr(rStr)
    };

  } catch (e) {
    console.error("Remainder Calc Error", e);
    return null;
  }
};

/**
 * Rounding to nearest multiple.
 */
export const roundToNearest = (value: number, nearest: number): number => {
  if (nearest === 0) return value;
  const res = Math.round(value / nearest) * nearest;
  return stripPrecisionError(res);
};

/**
 * Calculate percentage change.
 */
export const calculatePercentage = (
  amount: number, 
  percent: number, 
  isDiscount: boolean
): { finalAmount: number; diff: number } => {
  const cleanAmount = stripPrecisionError(amount);
  const cleanPercent = stripPrecisionError(percent);
  
  const rawDiff = cleanAmount * (cleanPercent / 100);
  const cleanDiff = stripPrecisionError(rawDiff);

  const finalDiff = Math.floor(cleanDiff);
  const finalAmount = isDiscount ? cleanAmount - finalDiff : cleanAmount + finalDiff;
  
  return {
    finalAmount: stripPrecisionError(finalAmount), 
    diff: finalDiff
  };
};

/**
 * Safe arithmetic evaluation.
 */
export const safeEvaluate = (expression: string): number => {
  try {
    const cleanExpr = expression.replace(/[^0-9+\-*/().\s]/g, '');
    if (!cleanExpr) return 0;
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${cleanExpr})`)();
    return stripPrecisionError(result);
  } catch (e) {
    return NaN;
  }
};

// --- New Math Functions for V1.5.0 ---

/**
 * Factorial calculation (n!)
 */
export const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
    if (!isFinite(result)) return Infinity;
  }
  return result;
};

/**
 * Permutations (nPr)
 */
export const permutations = (n: number, r: number): number => {
  if (n < 0 || r < 0 || r > n) return NaN;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
    if (!isFinite(result)) return Infinity;
  }
  return result;
};

/**
 * Combinations (nCr)
 */
export const combinations = (n: number, r: number): number => {
  if (n < 0 || r < 0 || r > n) return NaN;
  if (r === 0 || r === n) return 1;
  if (r > n / 2) r = n - r; // Optimize: nCr = nC(n-r)
  
  // result = nPr / r!
  let result = 1;
  for (let i = 1; i <= r; i++) {
    result = result * (n - i + 1) / i;
    if (!isFinite(result)) return Infinity;
  }
  return Math.round(result); // Clean up floating point errors in division
};

/**
 * Greatest Common Divisor (GCD) using Euclidean algorithm
 */
export const gcd = (a: number, b: number): number => {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
};

/**
 * Least Common Multiple (LCM)
 */
export const lcm = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  return (a * b) / gcd(a, b);
};

/**
 * Prime Factorization
 * Returns an object map { 2: 3, 5: 1 } for 2^3 * 5^1.
 * Returns null if calculation is too heavy (limit: 100 Trillion).
 */
export const primeFactorization = (n: number): Record<number, number> | null => {
  let num = Math.abs(Math.round(n));
  
  // Safety cap: 100 Trillion. Prevents UI freeze.
  if (num > 100_000_000_000_000) return null;

  const factors: Record<number, number> = {};
  if (num < 2) return factors; // 0 and 1 have no prime factors

  // Check 2
  while (num % 2 === 0) {
    factors[2] = (factors[2] || 0) + 1;
    num /= 2;
  }

  // Check odd numbers
  // sqrt(10^14) = 10^7 (10 million iterations max), which is safe for modern devices (~50-100ms)
  for (let i = 3; i * i <= num; i += 2) {
    while (num % i === 0) {
      factors[i] = (factors[i] || 0) + 1;
      num /= i;
    }
  }

  if (num > 1) {
    factors[num] = (factors[num] || 0) + 1;
  }

  return factors;
};

/**
 * Format prime factors into string (e.g., "2² × 3")
 */
export const formatPrimeFactors = (factors: Record<number, number>): string => {
  const keys = Object.keys(factors).map(Number).sort((a, b) => a - b);
  if (keys.length === 0) return "なし";
  
  return keys.map(prime => {
    const power = factors[prime];
    return power === 1 ? `${prime}` : `${prime}^${power}`;
  }).join(' × ');
};