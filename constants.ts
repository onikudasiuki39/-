import { VersionLog, CalculatorMode } from './types';
import { Calculator, Divide, Hash, PercentCircle, Scaling, ShoppingBag, Network, Split } from 'lucide-react';

export const APP_NAME = "OmniCalc Pro";

export const VERSION_HISTORY: VersionLog[] = [
  {
    version: "V1.5.1",
    date: "2024-05-26",
    changes: [
      "あまり計算エンジンの強化（指数表記の数値も正確に処理）",
      "素因数分解の安全装置を追加（フリーズ防止のため桁数制限を設定）",
      "計算結果が大きすぎる場合の表示を「桁オーバー」に変更"
    ]
  },
  {
    version: "V1.5.0",
    date: "2024-05-26",
    changes: [
      "「順列・組み合わせ」機能を追加（場合の数の計算）",
      "「約数・倍数・素因数分解」機能を追加（宿題の丸付けに最適）",
      "メニューの構成を整理"
    ]
  },
  {
    version: "V1.4.3",
    date: "2024-05-25",
    changes: [
      "標準電卓での入力制御を強化（小数点の連打防止など）",
      "割引・税込計算の整合性を修正（端数処理による1円の誤差を解消）",
      "内部コードの最適化とクリーンアップ"
    ]
  },
  {
    version: "V1.4.2",
    date: "2024-05-24",
    changes: [
      "割り算のあまり計算ロジックを修正（指定した桁数に基づく正確なあまりを算出）",
      "「割り切れる場合はあまり0」の判定を厳密化",
    ]
  },
  {
    version: "V1.4.1",
    date: "2024-05-24",
    changes: [
      "割り算・概数モードの表示設定文言を調整",
    ]
  },
  {
    version: "V1.4.0",
    date: "2024-05-24",
    changes: [
      "割り算・概数モードに「あまり計算」オプションを追加",
      "入力フォームのUIデザインを改善し、より直感的に変更",
    ]
  },
  {
    version: "V1.3.0",
    date: "2024-05-23",
    changes: [
      "全ての計算で小数を完全サポート（あまり計算含む）",
      "計算精度の向上（浮動小数点誤差の自動補正）",
      "バグ修正と安定性の向上"
    ]
  },
  {
    version: "V1.2.0",
    date: "2024-05-22",
    changes: [
      "「割り算と概数」機能を追加（商の四捨五入などを一括計算）",
      "「どちらが得？」機能を追加（単価の自動計算・比較）",
      "端数処理ロジックの強化"
    ]
  },
  {
    version: "V1.1.0",
    date: "2024-05-21",
    changes: [
      "割引・消費税計算機能の追加",
      "計算履歴のコピー＆シェア機能の追加",
      "UIの微調整"
    ]
  },
  {
    version: "V1.0.0",
    date: "2024-05-20",
    changes: [
      "アプリの初期リリース",
      "標準計算機（四捨五入設定付き）の実装",
      "あまり計算（Modulo）機能の追加",
      "概数・端数処理ツールの追加",
      "計算履歴の保存機能",
    ]
  }
];

export const MODES = [
  { id: CalculatorMode.STANDARD, label: '標準・四捨五入', icon: Calculator, description: '一般的な計算と小数点処理' },
  { id: CalculatorMode.ADVANCED_DIV, label: '割り算・概数', icon: Scaling, description: '商を指定の位で丸める' },
  { id: CalculatorMode.REMAINDER, label: 'あまり計算', icon: Divide, description: '整数の割り算と余り' },
  { id: CalculatorMode.INTEGER_TOOLS, label: '約数・倍数・素因数', icon: Split, description: '最大公約数や素因数分解' },
  { id: CalculatorMode.COMBINATORICS, label: '順列・組み合わせ', icon: Network, description: 'nCr, nPr, 階乗の計算' },
  { id: CalculatorMode.ROUNDING, label: '概数・端数', icon: Hash, description: '数値の丸め処理のみ' },
  { id: CalculatorMode.DISCOUNT, label: '割引・税込', icon: PercentCircle, description: '％計算と消費税' },
  { id: CalculatorMode.UNIT_PRICE, label: 'どちらが得？', icon: ShoppingBag, description: '単価比較で最安を判定' },
];