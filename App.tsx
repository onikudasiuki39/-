import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Camera, CheckCircle2, Clock, CloudSun, Copy, Download, ExternalLink, MapPin, Radio, RotateCw, Satellite, Settings, ShipWheel, Waves, Wifi } from 'lucide-react';
import { APP_NAME, CAMERA_ROTATION_SECONDS, DOWNLOAD_STEPS, INTEGRATIONS, LIVE_CAMERAS, MOCK_ALERTS, OBS_USAGE_STEPS, SAFETY_NOTES } from './constants';
import { AlertType, DisasterAlert, GuideStep, LiveCamera } from './types';

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const distanceKm = (from: Pick<LiveCamera | DisasterAlert, 'latitude' | 'longitude'>, to: Pick<LiveCamera | DisasterAlert, 'latitude' | 'longitude'>) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const categoryLabel: Record<LiveCamera['category'], string> = {
  city: '市街地',
  coast: '海・港',
  river: '河川',
  mountain: '山岳',
  road: '道路',
};

const alertStyles: Record<AlertType, { label: string; panel: string; pill: string; icon: React.ReactNode }> = {
  normal: {
    label: '平常巡回',
    panel: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    pill: 'bg-emerald-600 text-white',
    icon: <CloudSun className="h-5 w-5" />,
  },
  earthquake: {
    label: '地震連動',
    panel: 'border-amber-200 bg-amber-50 text-amber-950',
    pill: 'bg-amber-600 text-white',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  tsunami: {
    label: '津波優先',
    panel: 'border-sky-200 bg-sky-50 text-sky-950',
    pill: 'bg-sky-600 text-white',
    icon: <Waves className="h-5 w-5" />,
  },
};

const selectCameraQueue = (alert: DisasterAlert) => {
  if (alert.type === 'tsunami') {
    return [...LIVE_CAMERAS]
      .filter((camera) => camera.category === 'coast')
      .sort((a, b) => b.priority - a.priority);
  }

  if (alert.type === 'earthquake') {
    return [...LIVE_CAMERAS].sort((a, b) => distanceKm(a, alert) - distanceKm(b, alert));
  }

  return [...LIVE_CAMERAS].sort((a, b) => b.priority - a.priority);
};

const App: React.FC = () => {
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(0);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const activeAlert = MOCK_ALERTS[selectedAlertIndex];
  const style = alertStyles[activeAlert.type];

  const cameraQueue = useMemo(() => selectCameraQueue(activeAlert), [activeAlert]);
  const activeCamera = cameraQueue[cameraIndex % cameraQueue.length];

  useEffect(() => {
    setCameraIndex(0);
  }, [selectedAlertIndex]);

  useEffect(() => {
    if (!isAutoRotate) return;
    const timer = window.setInterval(() => {
      setCameraIndex((current) => (current + 1) % cameraQueue.length);
    }, CAMERA_ROTATION_SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, [cameraQueue.length, isAutoRotate]);

  const nearbyDistance = Math.round(distanceKm(activeCamera, activeAlert));
  const coastCount = LIVE_CAMERAS.filter((camera) => camera.category === 'coast').length;
  const obsUrl = `${window.location.origin}${window.location.pathname}?mode=obs`;

  const copyObsUrl = async () => {
    await navigator.clipboard.writeText(obsUrl);
  };

  const downloadConfig = () => {
    const config = {
      app: APP_NAME,
      rotationSeconds: CAMERA_ROTATION_SECONDS,
      selectedAlert: activeAlert,
      activeCameraQueue: cameraQueue.map(({ id, name, prefecture, category, source, streamUrl }) => ({ id, name, prefecture, category, source, streamUrl })),
      obsBrowserSourceUrl: obsUrl,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quakecam-obs-config.json';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300 ring-1 ring-cyan-300/30">
                <Radio className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">{APP_NAME}</h1>
                <p className="text-sm text-slate-400">地震・津波アラートに連動するOBS向けライブカメラ自動編成アプリ</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {MOCK_ALERTS.map((alert, index) => (
              <button
                key={alert.type}
                onClick={() => setSelectedAlertIndex(index)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  selectedAlertIndex === index ? alertStyles[alert.type].pill : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                {alert.title}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyObsUrl} className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-300">
              <Copy className="h-4 w-4" /> OBS URLコピー
            </button>
            <button onClick={downloadConfig} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-100">
              <Download className="h-4 w-4" /> 設定JSON保存
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1fr_380px] md:px-8">
        <section className="space-y-6">
          <div className={`rounded-3xl border p-5 shadow-2xl ${style.panel}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/70 p-3">{style.icon}</div>
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.25em] opacity-70">{style.label}</div>
                  <h2 className="text-2xl font-black md:text-3xl">{activeAlert.location}</h2>
                  <p className="mt-1 text-sm md:text-base">{activeAlert.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm md:min-w-64">
                <div className="rounded-2xl bg-white/70 p-3">
                  <div className="font-bold opacity-60">発表元</div>
                  <div className="font-black">{activeAlert.issuedAt}</div>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <div className="font-bold opacity-60">規模</div>
                  <div className="font-black">{activeAlert.magnitude ? `M${activeAlert.magnitude} / ${activeAlert.intensity}` : '監視中'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-5 py-4">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-cyan-300" />
                <div>
                  <h3 className="font-black">{activeCamera.name}</h3>
                  <p className="text-xs text-slate-400">{activeCamera.prefecture} / {activeCamera.source}</p>
                </div>
              </div>
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black tracking-widest">LIVE</span>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
              <iframe
                title={activeCamera.name}
                src={activeCamera.embedUrl}
                className="absolute inset-0 h-full w-full opacity-80"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-cyan-200 ring-1 ring-cyan-300/30">
                      <MapPin className="h-3 w-3" />
                      {activeAlert.type === 'normal' ? '全国ローテーション' : `対象地点から約${nearbyDistance}km`}
                    </div>
                    <h2 className="text-3xl font-black drop-shadow md:text-5xl">{activeCamera.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">OBS Browser Sourceにこの画面を取り込むと、平常時は6秒巡回、地震時は震源付近、津波時は海岸カメラへ自動切替する想定です。</p>
                  </div>
                  <button
                    onClick={() => setIsAutoRotate((current) => !current)}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-100"
                  >
                    {isAutoRotate ? '自動切替を停止' : '自動切替を再開'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Metric icon={<Satellite />} label="検出済みカメラ" value={`${LIVE_CAMERAS.length}件`} />
            <Metric icon={<ShipWheel />} label="海カメラ" value={`${coastCount}件`} />
            <Metric icon={<Clock />} label="通常切替" value={`${CAMERA_ROTATION_SECONDS}秒`} />
            <Metric icon={<Wifi />} label="OBS連携" value="WebSocket" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <GuideCard title="ダウンロード・起動" icon={<Download className="h-5 w-5" />} steps={DOWNLOAD_STEPS} />
            <GuideCard title="OBSでの使い方" icon={<BookOpen className="h-5 w-5" />} steps={OBS_USAGE_STEPS} />
          </div>
        </section>

        <aside className="space-y-6">
          <Panel title="自動選局キュー" icon={<RotateCw className="h-5 w-5" />}>
            <div className="space-y-3">
              {cameraQueue.map((camera, index) => (
                <button
                  key={camera.id}
                  onClick={() => setCameraIndex(index)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    activeCamera.id === camera.id ? 'border-cyan-300 bg-cyan-300/15' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold">{camera.name}</div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-300">{categoryLabel[camera.category]}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{camera.prefecture} / {camera.region}</span>
                    <span>{activeAlert.type === 'normal' ? `優先度 ${camera.priority}` : `${Math.round(distanceKm(camera, activeAlert))}km`}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="連携・取得設計" icon={<Settings className="h-5 w-5" />}>
            <div className="space-y-3">
              {INTEGRATIONS.map((integration) => (
                <div key={integration.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black">{integration.name}</h3>
                    <span className="rounded-full bg-slate-700 px-2 py-1 text-[10px] font-black uppercase text-cyan-200">{integration.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{integration.description}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="外部カメラソース" icon={<Radio className="h-5 w-5" />}>
            <p className="text-sm text-slate-400">YouTube Live、Cametan、自治体・道路管理者、河川カメラを統合し、公開条件を満たす配信だけをキュー化します。</p>
            <a href="https://www.cametan.com/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 hover:bg-cyan-100">
              Cametanを開く <ExternalLink className="h-4 w-4" />
            </a>
          </Panel>

          <Panel title="安全に使うための注意" icon={<CheckCircle2 className="h-5 w-5" />}>
            <ul className="space-y-3 text-sm text-slate-300">
              {SAFETY_NOTES.map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </main>
    </div>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">{icon}</div>
    <div className="text-sm text-slate-400">{label}</div>
    <div className="text-2xl font-black">{value}</div>
  </div>
);

const GuideCard: React.FC<{ title: string; icon: React.ReactNode; steps: GuideStep[] }> = ({ title, icon, steps }) => (
  <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
    <div className="mb-4 flex items-center gap-3 text-cyan-200">
      {icon}
      <h2 className="text-lg font-black text-white">{title}</h2>
    </div>
    <ol className="space-y-3">
      {steps.map((step) => (
        <li key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="font-black text-white">{step.title}</div>
          <p className="mt-1 text-sm text-slate-400">{step.description}</p>
          {step.command && <code className="mt-3 block rounded-xl bg-black/40 px-3 py-2 font-mono text-sm text-cyan-100">{step.command}</code>}
        </li>
      ))}
    </ol>
  </section>
);

const Panel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
    <div className="mb-4 flex items-center gap-3 text-cyan-200">
      {icon}
      <h2 className="text-lg font-black text-white">{title}</h2>
    </div>
    {children}
  </section>
);

export default App;
