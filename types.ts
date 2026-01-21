
export enum CalculatorMode {
  STANDARD = 'STANDARD',
  REMAINDER = 'REMAINDER',
  ROUNDING = 'ROUNDING',
  DISCOUNT = 'DISCOUNT',
  ADVANCED_DIV = 'ADVANCED_DIV',
  UNIT_PRICE = 'UNIT_PRICE',
  COMBINATORICS = 'COMBINATORICS', // nCr, nPr
  INTEGER_TOOLS = 'INTEGER_TOOLS'  // GCD, LCM, Prime Factors
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: CalculatorMode;
  expression: string;
  result: string;
}

export interface VersionLog {
  version: string;
  date: string;
  changes: string[];
}

export type RoundingMethod = 'round' | 'ceil' | 'floor';
