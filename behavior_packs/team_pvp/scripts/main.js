import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";

const KEY = "tpvp:data";
const ADMIN_NAME = "admin:0309";
const DEFAULT_TEAM_COLORS = ["§c", "§9", "§a", "§e", "§5", "§b", "§6", "§d", "§8", "§f"];
const MAX_TEAMS = 10;
const PROTECT_TAG = "tpvp_protected";

const defaultState = {
  game: {
    active: false,
    startedAt: 0,
    timeLimitSec: 900,
    friendlyFire: false,
    respawnProtectSec: 4,
    winMode: "lastTeam", // lastTeam | kills | lives
    targetKills: 20
  },
  settings: {
    initialLives: 5,
    woolBlock: "minecraft:wool",
    woolRange: { x1: -10, x2: 10, z1: -10, z2: 10 }
  },
  teams: [],
  players: {}
};

let state = structuredClone(defaultState);
let pendingDamageCancel = new Set();

function safeRun(name, fn) {
  try { fn(); } catch (e) { console.warn(`[TPVP:${name}] ${e}`); }
}

function saveState() {
  safeRun("saveState", () => world.setDynamicProperty(KEY, JSON.stringify(state)));
}

function loadState() {
  safeRun("loadState", () => {
    const raw = world.getDynamicProperty(KEY);
    if (typeof raw === "string" && raw.length > 2) {
      const parsed = JSON.parse(raw);
      state = {
        ...structuredClone(defaultState),
        ...parsed,
        game: { ...defaultState.game, ...(parsed.game ?? {}) },
        settings: { ...defaultState.settings, ...(parsed.settings ?? {}) }
      };
    }
  });
}

function ensurePlayerData(player) {
  const id = player.id;
  if (!state.players[id]) {
    state.players[id] = { lives: state.settings.initialLives, kills: 0, teamId: null, protectedUntil: 0 };
  }
  return state.players[id];
}

function getTeam(teamId) {
  return state.teams.find(t => t.id === teamId) ?? null;
}

function getPlayerTeam(player) {
  const pd = ensurePlayerData(player);
  return pd.teamId ? getTeam(pd.teamId) : null;
}

function colorName(team) {
  return `${team.color}${team.name}§r`;
}

function updateHud(player) {
  const pd = ensurePlayerData(player);
  const team = pd.teamId ? getTeam(pd.teamId) : null;
  const teamLives = team ? team.members.map(id => state.players[id]?.lives ?? 0).reduce((a, b) => a + b, 0) : 0;
  player.onScreenDisplay.setActionBar(`§7Team:${team ? colorName(team) : "§8None§r"} §fTL:${teamLives} §aLife:${pd.lives} §cKills:${pd.kills}`);
}

function updateAllHud() {
  for (const p of world.getAllPlayers()) updateHud(p);
}

function joinTeam(player, teamId) {
  const pd = ensurePlayerData(player);
  if (pd.teamId) leaveTeam(player);
  const t = getTeam(teamId);
  if (!t) return;
  pd.teamId = teamId;
  if (!t.members.includes(player.id)) t.members.push(player.id);
  player.nameTag = `${t.color}[${t.name}] §r${player.name}`;
  saveState();
  updateHud(player);
}

function leaveTeam(player) {
  const pd = ensurePlayerData(player);
  if (!pd.teamId) return;
  const t = getTeam(pd.teamId);
  if (t) t.members = t.members.filter(id => id !== player.id);
  pd.teamId = null;
  player.nameTag = player.name;
  saveState();
  updateHud(player);
}

function findSafeY(dimension, x, z) {
  for (let y = 320; y >= -64; y--) {
    const b = dimension.getBlock({ x, y, z });
    const up = dimension.getBlock({ x, y: y + 1, z });
    const up2 = dimension.getBlock({ x, y: y + 2, z });
    if (b && up && up2 && !b.isAir && up.isAir && up2.isAir) return y + 1;
  }
  return 100;
}

function spawnForTeam(player, team) {
  const dim = player.dimension;
  let x = 0, z = 0;
  if (team.randomSpawn.enabled) {
    x = randInt(team.randomSpawn.x1, team.randomSpawn.x2);
    z = randInt(team.randomSpawn.z1, team.randomSpawn.z2);
  } else {
    x = team.spawn.x;
    z = team.spawn.z;
  }
  const y = findSafeY(dim, Math.floor(x), Math.floor(z));
  player.teleport({ x: Math.floor(x) + 0.5, y, z: Math.floor(z) + 0.5 }, { dimension: dim });
}

function randInt(a, b) {
  const mn = Math.min(a, b);
  const mx = Math.max(a, b);
  return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}

function aliveTeams() {
  return state.teams.filter(t => t.members.some(pid => (state.players[pid]?.lives ?? 0) > 0));
}

function endGame(msg) {
  state.game.active = false;
  for (const p of world.getAllPlayers()) {
    p.sendMessage(`§6[TPVP] ${msg}`);
    safeRun("gmSurvival", () => p.runCommand("gamemode survival @s"));
  }
  saveState();
}

function checkWin() {
  if (!state.game.active) return;
  if (state.game.winMode === "lastTeam") {
    const alive = aliveTeams();
    if (alive.length <= 1) endGame(alive[0] ? `${colorName(alive[0])} §6wins!` : "No winner.");
  } else if (state.game.winMode === "kills") {
    let bestTeam = null;
    let bestKills = -1;
    for (const t of state.teams) {
      const k = t.members.reduce((s, id) => s + (state.players[id]?.kills ?? 0), 0);
      if (k > bestKills) { bestKills = k; bestTeam = t; }
    }
    if (bestKills >= state.game.targetKills && bestTeam) endGame(`${colorName(bestTeam)} §6wins by kills (${bestKills})!`);
  } else if (state.game.winMode === "lives") {
    const ranked = [...state.teams].map(t => ({ t, l: t.members.reduce((s, id) => s + (state.players[id]?.lives ?? 0), 0) })).sort((a, b) => b.l - a.l);
    if (ranked.length > 1 && ranked[0].l > ranked[1].l && ranked[1].l <= 0) endGame(`${colorName(ranked[0].t)} §6wins by lives!`);
  }
}

function processWoolDelete(player) {
  const { x1, x2, z1, z2 } = state.settings.woolRange;
  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
  const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);
  const dim = player.dimension;
  const target = state.settings.woolBlock;

  let x = minX;
  let z = minZ;
  let y = -64;
  let removed = 0;

  const job = system.runInterval(() => {
    let steps = 0;
    while (steps < 500) {
      const b = dim.getBlock({ x, y, z });
      if (b?.typeId === target) {
        b.setType("minecraft:air");
        removed++;
      }
      y++;
      if (y > 320) { y = -64; z++; }
      if (z > maxZ) { z = minZ; x++; }
      if (x > maxX) {
        system.clearRun(job);
        player.sendMessage(`§a[TPVP] Wool delete finished. Removed: ${removed}`);
        return;
      }
      steps++;
    }
  }, 1);
}

async function openAdminMenu(player) {
  const form = new ActionFormData().title("TPVP Admin").body("設定を選択").button("チーム管理").button("ゲーム設定").button("残機管理").button("羊毛削除").button("ランキング").button("ゲーム開始/終了");
  const r = await form.show(player);
  if (r.canceled) return;
  if (r.selection === 0) return openTeamMenu(player);
  if (r.selection === 1) return openGameSettings(player);
  if (r.selection === 2) return openLivesMenu(player);
  if (r.selection === 3) return openWoolMenu(player);
  if (r.selection === 4) return showRanking(player);
  if (r.selection === 5) return toggleGame(player);
}

async function openTeamMenu(player) {
  const form = new ActionFormData().title("Team").button("作成").button("削除").button("色変更").button("スポーン設定").button("ランダムスポーン設定").button("参加").button("退出");
  const r = await form.show(player); if (r.canceled) return;
  const s = r.selection;
  if (s === 0) return createTeamUI(player);
  if (s === 1) return deleteTeamUI(player);
  if (s === 2) return colorTeamUI(player);
  if (s === 3) return setSpawnUI(player);
  if (s === 4) return setRandomSpawnUI(player);
  if (s === 5) return joinTeamUI(player);
  if (s === 6) return leaveTeam(player);
}

async function createTeamUI(player) {
  if (state.teams.length >= MAX_TEAMS) return player.sendMessage("§cMax team reached");
  const f = new ModalFormData().title("Create Team").textField("チーム名", "Red").dropdown("色", DEFAULT_TEAM_COLORS.map((c, i) => `${c}Color ${i + 1}§r`), 0);
  const r = await f.show(player); if (r.canceled) return;
  const name = String(r.formValues[0]).trim(); if (!name) return;
  const color = DEFAULT_TEAM_COLORS[r.formValues[1]] ?? "§f";
  const id = `t_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  state.teams.push({ id, name, color, spawn: { x: 0, y: 100, z: 0 }, randomSpawn: { enabled: false, x1: -20, x2: 20, z1: -20, z2: 20 }, members: [] });
  saveState();
}

async function deleteTeamUI(player) {
  if (!state.teams.length) return;
  const f = new ModalFormData().title("Delete Team").dropdown("チーム", state.teams.map(t => t.name), 0);
  const r = await f.show(player); if (r.canceled) return;
  const idx = r.formValues[0];
  const team = state.teams[idx];
  if (!team) return;
  for (const pid of team.members) if (state.players[pid]) state.players[pid].teamId = null;
  state.teams.splice(idx, 1);
  saveState();
}

async function colorTeamUI(player) {
  if (!state.teams.length) return;
  const f = new ModalFormData().title("Team Color").dropdown("チーム", state.teams.map(t => t.name), 0).dropdown("色", DEFAULT_TEAM_COLORS.map((c, i) => `${c}Color ${i + 1}§r`), 0);
  const r = await f.show(player); if (r.canceled) return;
  const t = state.teams[r.formValues[0]];
  if (!t) return;
  t.color = DEFAULT_TEAM_COLORS[r.formValues[1]] ?? "§f";
  saveState();
}

async function setSpawnUI(player) {
  if (!state.teams.length) return;
  const f = new ModalFormData().title("Spawn").dropdown("チーム", state.teams.map(t => t.name), 0).textField("X", "0").textField("Z", "0");
  const r = await f.show(player); if (r.canceled) return;
  const t = state.teams[r.formValues[0]]; if (!t) return;
  t.spawn.x = Number(r.formValues[1]) || 0; t.spawn.z = Number(r.formValues[2]) || 0;
  saveState();
}

async function setRandomSpawnUI(player) {
  if (!state.teams.length) return;
  const f = new ModalFormData().title("Random Spawn").dropdown("チーム", state.teams.map(t => t.name), 0).toggle("有効", true).textField("X1", "-20").textField("X2", "20").textField("Z1", "-20").textField("Z2", "20");
  const r = await f.show(player); if (r.canceled) return;
  const t = state.teams[r.formValues[0]]; if (!t) return;
  t.randomSpawn.enabled = !!r.formValues[1];
  t.randomSpawn.x1 = Number(r.formValues[2]) || -20;
  t.randomSpawn.x2 = Number(r.formValues[3]) || 20;
  t.randomSpawn.z1 = Number(r.formValues[4]) || -20;
  t.randomSpawn.z2 = Number(r.formValues[5]) || 20;
  saveState();
}

async function joinTeamUI(player) {
  if (!state.teams.length) return;
  const f = new ModalFormData().title("Join Team").dropdown("チーム", state.teams.map(t => t.name), 0);
  const r = await f.show(player); if (r.canceled) return;
  const t = state.teams[r.formValues[0]]; if (!t) return;
  joinTeam(player, t.id);
}

async function openGameSettings(player) {
  const f = new ModalFormData().title("Game Settings").toggle("FF ON", state.game.friendlyFire).textField("保護秒", String(state.game.respawnProtectSec)).textField("試合時間(秒)", String(state.game.timeLimitSec)).dropdown("勝利条件", ["lastTeam", "kills", "lives"], ["lastTeam", "kills", "lives"].indexOf(state.game.winMode)).textField("目標キル", String(state.game.targetKills));
  const r = await f.show(player); if (r.canceled) return;
  state.game.friendlyFire = !!r.formValues[0];
  state.game.respawnProtectSec = Math.max(0, Number(r.formValues[1]) || 0);
  state.game.timeLimitSec = Math.max(30, Number(r.formValues[2]) || 900);
  state.game.winMode = ["lastTeam", "kills", "lives"][r.formValues[3]];
  state.game.targetKills = Math.max(1, Number(r.formValues[4]) || 20);
  saveState();
}

async function openLivesMenu(player) {
  const f = new ActionFormData().title("Lives").button("全員初期化").button("個別変更");
  const r = await f.show(player); if (r.canceled) return;
  if (r.selection === 0) {
    const set = await new ModalFormData().title("Initial Lives").textField("初期残機", String(state.settings.initialLives)).show(player);
    if (set.canceled) return;
    state.settings.initialLives = Math.max(1, Number(set.formValues[0]) || 5);
    for (const p of world.getAllPlayers()) ensurePlayerData(p).lives = state.settings.initialLives;
    saveState(); updateAllHud();
  }
  if (r.selection === 1) {
    const players = world.getAllPlayers();
    if (!players.length) return;
    const pick = await new ModalFormData().title("Player Lives").dropdown("プレイヤー", players.map(p => p.name), 0).textField("残機", "5").show(player);
    if (pick.canceled) return;
    const target = players[pick.formValues[0]];
    ensurePlayerData(target).lives = Math.max(0, Number(pick.formValues[1]) || 0);
    saveState(); updateHud(target);
  }
}

async function openWoolMenu(player) {
  const f = new ModalFormData().title("Wool Remove").textField("block id", state.settings.woolBlock).textField("X1", String(state.settings.woolRange.x1)).textField("X2", String(state.settings.woolRange.x2)).textField("Z1", String(state.settings.woolRange.z1)).textField("Z2", String(state.settings.woolRange.z2));
  const r = await f.show(player); if (r.canceled) return;
  state.settings.woolBlock = String(r.formValues[0]) || "minecraft:wool";
  state.settings.woolRange = { x1: Number(r.formValues[1]) || -10, x2: Number(r.formValues[2]) || 10, z1: Number(r.formValues[3]) || -10, z2: Number(r.formValues[4]) || 10 };
  saveState();
  const conf = await new MessageFormData().title("実行").body("今すぐ削除しますか？").button1("はい").button2("いいえ").show(player);
  if (!conf.canceled && conf.selection === 0) processWoolDelete(player);
}

async function showRanking(player) {
  const rows = Object.entries(state.players)
    .map(([id, d]) => ({ id, kills: d.kills ?? 0 }))
    .sort((a, b) => b.kills - a.kills)
    .slice(0, 5)
    .map((r, i) => {
      const pl = world.getAllPlayers().find(p => p.id === r.id);
      return `§e#${i + 1} §f${pl ? pl.name : r.id.slice(0, 6)} : §c${r.kills}`;
    }).join("\n");
  player.sendMessage(`§6--- Kill Ranking ---\n${rows || "No data"}`);
}

function toggleGame(player) {
  state.game.active = !state.game.active;
  if (state.game.active) {
    state.game.startedAt = Date.now();
    for (const p of world.getAllPlayers()) {
      const pd = ensurePlayerData(p);
      pd.kills = 0;
      if (pd.lives <= 0) pd.lives = state.settings.initialLives;
      const t = getPlayerTeam(p); if (t) spawnForTeam(p, t);
      safeRun("gmSurvival", () => p.runCommand("gamemode survival @s"));
      updateHud(p);
    }
    world.sendMessage("§a[TPVP] Match started");
  } else {
    world.sendMessage("§c[TPVP] Match ended by admin");
  }
  saveState();
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => safeRun("playerSpawn", () => {
  const pd = ensurePlayerData(player);
  if (!initialSpawn && state.game.active) {
    if (pd.lives <= 0) {
      safeRun("gmSpec", () => player.runCommand("gamemode spectator @s"));
      return;
    }
    const t = getPlayerTeam(player);
    if (t) spawnForTeam(player, t);
    pd.protectedUntil = Date.now() + state.game.respawnProtectSec * 1000;
    player.addTag(PROTECT_TAG);
    system.runTimeout(() => safeRun("removeProtect", () => player.removeTag(PROTECT_TAG)), state.game.respawnProtectSec * 20);
  }
  updateHud(player);
}));

world.beforeEvents.entityHurt.subscribe((ev) => safeRun("entityHurt", () => {
  const hurt = ev.hurtEntity;
  if (hurt.typeId !== "minecraft:player") return;
  const victim = hurt;
  if (victim.hasTag(PROTECT_TAG)) { ev.cancel = true; return; }
  const source = ev.damageSource?.damagingEntity;
  if (source?.typeId === "minecraft:player") {
    const atk = source;
    const vt = getPlayerTeam(victim);
    const at = getPlayerTeam(atk);
    if (!state.game.friendlyFire && vt && at && vt.id === at.id) ev.cancel = true;
  }
}));

world.afterEvents.entityDie.subscribe((ev) => safeRun("entityDie", () => {
  const dead = ev.deadEntity;
  if (dead.typeId !== "minecraft:player") return;
  const victim = dead;
  const vpd = ensurePlayerData(victim);
  if (state.game.active) {
    vpd.lives = Math.max(0, vpd.lives - 1);
    if (vpd.lives <= 0) safeRun("gmSpec", () => victim.runCommand("gamemode spectator @s"));
  }
  const killer = ev.damageSource?.damagingEntity;
  if (killer?.typeId === "minecraft:player" && killer.id !== victim.id) {
    const kpd = ensurePlayerData(killer);
    kpd.kills++;
    world.sendMessage(`§c${killer.name} §fが §b${victim.name} §fを倒した`);
  }
  saveState();
  updateAllHud();
  checkWin();
}));

world.beforeEvents.itemUse.subscribe((ev) => safeRun("itemUse", () => {
  const p = ev.source;
  const item = ev.itemStack;
  if (!p || item.typeId !== "minecraft:stick") return;
  const n = (item.nameTag ?? "").trim();
  if (n === ADMIN_NAME) system.run(() => openAdminMenu(p));
}));

system.runInterval(() => safeRun("timerTick", () => {
  if (!state.game.active) return;
  const elapsedSec = Math.floor((Date.now() - state.game.startedAt) / 1000);
  const left = state.game.timeLimitSec - elapsedSec;
  if (left === 60 || left === 30 || left === 10) world.sendMessage(`§e[TPVP] ${left}s left`);
  if (left <= 0) {
    if (state.game.winMode === "kills") {
      let bestTeam = null; let bestKills = -1;
      for (const t of state.teams) {
        const k = t.members.reduce((s, id) => s + (state.players[id]?.kills ?? 0), 0);
        if (k > bestKills) { bestKills = k; bestTeam = t; }
      }
      endGame(bestTeam ? `${colorName(bestTeam)} §6wins by time-kills!` : "Time up.");
    } else {
      checkWin();
      if (state.game.active) endGame("Time up.");
    }
  }
}), 20);

system.runInterval(() => safeRun("cleanup", () => {
  // 低頻度HUD更新（イベント駆動主体 + 補正）
  updateAllHud();
}), 100);

safeRun("init", () => {
  world.setDynamicProperty(KEY, world.getDynamicProperty(KEY) ?? JSON.stringify(defaultState));
  loadState();
  for (const p of world.getAllPlayers()) ensurePlayerData(p);
  saveState();
});
