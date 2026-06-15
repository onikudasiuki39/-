export type AlertType = 'earthquake' | 'tsunami' | 'normal';

export interface LiveCamera {
  id: string;
  name: string;
  prefecture: string;
  region: string;
  category: 'city' | 'coast' | 'river' | 'mountain' | 'road';
  source: 'YouTube Live' | 'Cametan' | '自治体・道路管理者' | '河川カメラ';
  streamUrl: string;
  embedUrl: string;
  latitude: number;
  longitude: number;
  priority: number;
}

export interface DisasterAlert {
  type: AlertType;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  magnitude?: number;
  intensity?: string;
  issuedAt: string;
  description: string;
}

export interface IntegrationEndpoint {
  name: string;
  description: string;
  status: 'ready' | 'planned' | 'mock';
}

export interface GuideStep {
  title: string;
  description: string;
  command?: string;
}

// Legacy calculator types kept so archived calculator components continue to type-check.
export enum CalculatorMode {
  STANDARD = 'STANDARD',
  REMAINDER = 'REMAINDER',
  ROUNDING = 'ROUNDING',
  DISCOUNT = 'DISCOUNT',
  ADVANCED_DIV = 'ADVANCED_DIV',
  UNIT_PRICE = 'UNIT_PRICE',
  COMBINATORICS = 'COMBINATORICS',
  INTEGER_TOOLS = 'INTEGER_TOOLS',
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
