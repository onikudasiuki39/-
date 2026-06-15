import { DisasterAlert, IntegrationEndpoint, LiveCamera } from './types';

export const APP_NAME = 'QuakeCam OBS Director';

export const CAMERA_ROTATION_SECONDS = 6;

export const LIVE_CAMERAS: LiveCamera[] = [
  {
    id: 'sapporo-odori',
    name: '札幌 大通公園ライブ',
    prefecture: '北海道',
    region: '北海道',
    category: 'city',
    source: 'YouTube Live',
    streamUrl: 'https://www.youtube.com/results?search_query=札幌+大通公園+ライブカメラ',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig',
    latitude: 43.0618,
    longitude: 141.3545,
    priority: 78,
  },
  {
    id: 'sendai-station',
    name: '仙台駅前ライブ',
    prefecture: '宮城県',
    region: '東北',
    category: 'city',
    source: 'Cametan',
    streamUrl: 'https://www.cametan.com/',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCkAGrHCLFmlK3H2kd6isipg',
    latitude: 38.2602,
    longitude: 140.8824,
    priority: 82,
  },
  {
    id: 'tokyo-shibuya',
    name: '東京 渋谷スクランブル交差点',
    prefecture: '東京都',
    region: '関東',
    category: 'city',
    source: 'YouTube Live',
    streamUrl: 'https://www.youtube.com/results?search_query=渋谷+スクランブル交差点+ライブカメラ',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC6Zc5iy2Pq8bWJKS4CrU5ow',
    latitude: 35.6595,
    longitude: 139.7005,
    priority: 95,
  },
  {
    id: 'chiba-kujukuri',
    name: '千葉 九十九里浜 海岸',
    prefecture: '千葉県',
    region: '関東',
    category: 'coast',
    source: '自治体・道路管理者',
    streamUrl: 'https://www.cametan.com/',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCoMdktPbSTixAyNGwb-UYkQ',
    latitude: 35.5377,
    longitude: 140.4443,
    priority: 91,
  },
  {
    id: 'shizuoka-suruga',
    name: '静岡 駿河湾沿岸',
    prefecture: '静岡県',
    region: '中部',
    category: 'coast',
    source: 'Cametan',
    streamUrl: 'https://www.cametan.com/',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw',
    latitude: 34.9733,
    longitude: 138.3889,
    priority: 94,
  },
  {
    id: 'niigata-coast',
    name: '新潟 日本海沿岸',
    prefecture: '新潟県',
    region: '北陸',
    category: 'coast',
    source: '河川カメラ',
    streamUrl: 'https://www.cametan.com/',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCBR8-60-B28hp2BmDPdntcQ',
    latitude: 37.9161,
    longitude: 139.0364,
    priority: 88,
  },
  {
    id: 'osaka-umeda',
    name: '大阪 梅田ライブ',
    prefecture: '大阪府',
    region: '近畿',
    category: 'city',
    source: 'YouTube Live',
    streamUrl: 'https://www.youtube.com/results?search_query=大阪+梅田+ライブカメラ',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC5w3mE7sT3Gw5s6u84p8lWQ',
    latitude: 34.7055,
    longitude: 135.4983,
    priority: 90,
  },
  {
    id: 'wakayama-shirahama',
    name: '和歌山 白浜海岸',
    prefecture: '和歌山県',
    region: '近畿',
    category: 'coast',
    source: 'Cametan',
    streamUrl: 'https://www.cametan.com/',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCupvZG-5ko_eiXAupbDfxWw',
    latitude: 33.6782,
    longitude: 135.3481,
    priority: 92,
  },
  {
    id: 'kochi-katsurahama',
    name: '高知 桂浜・太平洋',
    prefecture: '高知県',
    region: '四国',
    category: 'coast',
    source: '自治体・道路管理者',
    streamUrl: 'https://www.cametan.com/',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC8-Th83bH_thdKZDJCrn88g',
    latitude: 33.4963,
    longitude: 133.5751,
    priority: 96,
  },
  {
    id: 'fukuoka-hakata',
    name: '福岡 博多駅前',
    prefecture: '福岡県',
    region: '九州',
    category: 'city',
    source: 'YouTube Live',
    streamUrl: 'https://www.youtube.com/results?search_query=福岡+博多駅+ライブカメラ',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC0p5jTq6Xx_DosDFxVXnWaQ',
    latitude: 33.5904,
    longitude: 130.4208,
    priority: 84,
  },
  {
    id: 'okinawa-naha-port',
    name: '沖縄 那覇港・海岸',
    prefecture: '沖縄県',
    region: '沖縄',
    category: 'coast',
    source: 'Cametan',
    streamUrl: 'https://www.cametan.com/',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCrp_UI8XtuYfpiqluWLD7Lw',
    latitude: 26.2124,
    longitude: 127.6792,
    priority: 87,
  },
  {
    id: 'yamanashi-fuji',
    name: '山梨 富士山ビュー',
    prefecture: '山梨県',
    region: '中部',
    category: 'mountain',
    source: 'YouTube Live',
    streamUrl: 'https://www.youtube.com/results?search_query=富士山+ライブカメラ',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCw95T_TgbGHhTml4xZ9yIqg',
    latitude: 35.3606,
    longitude: 138.7274,
    priority: 80,
  },
];

export const MOCK_ALERTS: DisasterAlert[] = [
  {
    type: 'normal',
    title: '平常監視',
    location: '全国',
    latitude: 36.2048,
    longitude: 138.2529,
    issuedAt: '自動巡回中',
    description: '地震・津波アラートがないため、全国のライブカメラを6秒ごとに切り替えます。',
  },
  {
    type: 'earthquake',
    title: '地震速報デモ',
    location: '静岡県中部',
    latitude: 34.9769,
    longitude: 138.3831,
    magnitude: 6.1,
    intensity: '震度5強',
    issuedAt: 'Zero Quake Webhook 受信想定',
    description: '震源付近から近い順にライブカメラを自動選局します。',
  },
  {
    type: 'tsunami',
    title: '津波警報デモ',
    location: '太平洋沿岸',
    latitude: 33.4963,
    longitude: 133.5751,
    issuedAt: '気象庁 XML 受信想定',
    description: '海岸・港湾カテゴリのライブカメラを優先表示します。',
  },
];

export const INTEGRATIONS: IntegrationEndpoint[] = [
  {
    name: 'Zero Quake / 地震速報アプリ',
    description: 'Webhook・ローカル通知・URLスキームから震源緯度経度と震度を取り込みます。',
    status: 'ready',
  },
  {
    name: '気象庁 防災情報 XML',
    description: '地震情報、津波予報、津波警報を監視してOBSシーンを自動切替します。',
    status: 'planned',
  },
  {
    name: 'Cametan / YouTube Live クローラ',
    description: '利用規約を尊重し、公開ページ・RSS・手動登録から使用可能なカメラを検出します。',
    status: 'mock',
  },
  {
    name: 'OBS WebSocket',
    description: 'Browser Source のURL差し替え、テロップ表示、緊急シーン切替を行います。',
    status: 'ready',
  },
];

export const VERSION_HISTORY = [
  {
    version: 'V2.0.0',
    date: '2026-06-15',
    changes: [
      'OBS向けの地震・津波ライブカメラ自動編成ダッシュボードへ刷新',
      '平常時6秒ローテーション、地震時の近傍選局、津波時の海岸カメラ優先を追加',
      'Zero Quake、気象庁XML、Cametan、YouTube Live、OBS WebSocketの連携設計を表示',
    ],
  },
];

export const DOWNLOAD_STEPS = [
  {
    title: '1. ZIPをダウンロード',
    description: 'GitHubのCodeボタンからDownload ZIPを選び、PCの任意フォルダに展開します。',
  },
  {
    title: '2. 依存パッケージを入れる',
    description: '展開したフォルダでターミナルを開き、React/Viteの依存関係をインストールします。',
    command: 'npm install',
  },
  {
    title: '3. ローカルで起動',
    description: 'OBSに取り込む前にブラウザで動作確認します。標準では http://localhost:5173/ です。',
    command: 'npm run dev',
  },
  {
    title: '4. 配信用にビルド',
    description: '本番配信用の静的ファイルは dist フォルダに生成されます。',
    command: 'npm run build',
  },
];

export const OBS_USAGE_STEPS = [
  {
    title: 'OBS Browser Sourceを追加',
    description: 'OBSで「ソース」→「ブラウザ」を追加し、ローカル起動URLまたは配信サーバーURLを貼り付けます。',
  },
  {
    title: '幅1920・高さ1080を推奨',
    description: '地震テロップ、カメラ名、右側キューが見切れにくい16:9レイアウトです。',
  },
  {
    title: '平常時はそのまま巡回',
    description: 'アラートがない時は全国カメラを6秒ごとに自動切替します。停止ボタンで手動固定もできます。',
  },
  {
    title: '地震・津波テスト',
    description: '画面上部のデモボタンで、震源近傍選局と海岸優先選局の動きを確認できます。',
  },
];

export const SAFETY_NOTES = [
  '実運用では、YouTubeやCametan等の利用規約、埋め込み可否、自治体カメラの再配信条件を必ず確認してください。',
  '緊急情報は気象庁・自治体など一次情報と照合し、この画面だけを避難判断の根拠にしないでください。',
  'Zero Quake等との本接続はWebhook受信サーバーやOBS WebSocket認証を別途実装する想定です。',
];
