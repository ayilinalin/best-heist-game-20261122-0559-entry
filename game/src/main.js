// VAULTLINE — main.js
// Orkestrator: loop game, state machine (playing / levelComplete /
// caught / won), alarm meter, mode kejar, smoke, dan self-test
// (?selftest=1) yang memainkan 1 level penuh secara otomatis.

import { VIEW_W, VIEW_H, LEVEL_COUNT, ALARM_GUARD_RATE, ALARM_CAMERA_RATE, ALARM_DECAY_RATE, ALARM_CHASE_DECAY, ALARM_CHASE_END, ALARM_CHASE_AT, SCORE_PER_LOOT, SCORE_LEVEL_CLEAR, SCORE_TIME_BONUS_MAX, SMOKE_R, SMOKE_DURATION, SMOKES_PER_LEVEL } from './config.js';
import { buildLevel } from './level.js';
import { createPlayer, updatePlayer, tryPickup } from './player.js';
import { createGuard, updateGuard, guardSees } from './guard.js';
import { createCamera, updateCamera, cameraSees } from './camera.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { drawHud, drawPanel, fmtTime } from './hud.js';
import { drawScene } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const audio = createAudio();

function newState(levelNum, scoreStart = 0) {
  const levelDef = buildLevel(levelNum);
  const player = createPlayer(levelDef.start);
  player.smokesLeft = SMOKES_PER_LEVEL;
  return {
    level: levelNum,
    levelDef,
    player,
    guards: levelDef.guards.map(createGuard),
    cameras: levelDef.cameras.map(createCamera),
    loots: levelDef.loots.map((l) => ({ ...l, taken: false })),
    alarm: 0,
    chase: false,
    chaseTimer: 0,
    score: scoreStart,
    levelScoreStart: scoreStart,
    time: 0,
    status: 'playing', // playing | levelComplete | caught | won
    smoke: { x: 0, y: 0, r: SMOKE_R, t: 0, active: false },
    frozen: false,
    message: '',
  };
}

let state = newState(1);
let totalScore = 0;
let totalTime = 0;

const input = createInput(canvas, {
  onConfirm: () => advance(),
  onMute: () => audio.toggleMute(),
});

function advance() {
  if (state.status === 'levelComplete') {
    totalScore = state.score;
    totalTime += state.time;
    if (state.level >= LEVEL_COUNT) {
      state.status = 'won';
      return;
    }
    const keepScore = state.score;
    state = newState(state.level + 1, keepScore);
  } else if (state.status === 'caught') {
    state = newState(state.level, state.levelScoreStart);
  } else if (state.status === 'won') {
    totalScore = 0;
    totalTime = 0;
    state = newState(1);
  }
}

function throwSmoke() {
  const p = state.player;
  if (state.status !== 'playing' || p.smokesLeft <= 0 || state.smoke.active) return;
  p.smokesLeft -= 1;
  state.smoke = { x: p.x, y: p.y, r: SMOKE_R, t: SMOKE_DURATION, active: true };
  audio.smoke();
}

function update(dt) {
  if (state.status !== 'playing' || state.frozen) return;
  state.time += dt;
  const p = state.player;

  if (input.smokeQueued) {
    input.smokeQueued = false;
    throwSmoke();
  }
  if (state.smoke.active) {
    state.smoke.t -= dt;
    if (state.smoke.t <= 0) state.smoke.active = false;
  }

  updatePlayer(p, input, state.levelDef.walls, dt);
  const picked = tryPickup(p, state.loots, (n) => {
    state.score += n;
    audio.pickup();
  });
  if (picked) state.message = `${picked.kind} diambil! +${SCORE_PER_LOOT}`;

  // Deteksi: guard dan kamera.
  let seenByGuard = false;
  let seenByCamera = false;
  for (const g of state.guards) {
    if (guardSees(g, p, state.levelDef.walls, state.levelDef.shadows, state.smoke)) seenByGuard = true;
  }
  for (const cam of state.cameras) {
    if (cameraSees(cam, p, state.levelDef.walls, state.levelDef.shadows, state.smoke)) seenByCamera = true;
  }
  if (seenByGuard) state.alarm += ALARM_GUARD_RATE * dt;
  if (seenByCamera) state.alarm += ALARM_CAMERA_RATE * dt;
  if (!seenByGuard && !seenByCamera) {
    state.alarm -= (state.chase ? ALARM_CHASE_DECAY : ALARM_DECAY_RATE) * dt;
  }
  state.alarm = Math.max(0, Math.min(100, state.alarm));

  // Alarm penuh -> guard mengejar; alarm turun di bawah ambang -> reda.
  if (!state.chase && state.alarm >= ALARM_CHASE_AT) {
    state.chase = true;
    state.chaseTimer = 0;
  }
  if (state.chase && state.alarm <= ALARM_CHASE_END) state.chase = false;
  audio.setAlarm(state.chase);

  // Guard: patroli atau kejar; ketangkap saat disentuh ketika mengejar.
  for (const g of state.guards) {
    const caught = updateGuard(g, p, state.levelDef.walls, dt, state.chase);
    if (caught) {
      state.status = 'caught';
      audio.setAlarm(false);
      audio.caught();
      return;
    }
  }
  for (const cam of state.cameras) updateCamera(cam, dt);

  // Exit terbuka bila semua loot diambil; sampai exit -> level selesai.
  const allLoot = state.loots.every((l) => l.taken);
  if (allLoot) {
    const ex = state.levelDef.exit;
    if (p.x > ex.x && p.x < ex.x + ex.w && p.y > ex.y && p.y < ex.y + ex.h) {
      const timeBonus = Math.max(0, SCORE_TIME_BONUS_MAX - Math.floor(state.time - state.levelDef.par) * 5);
      state.score += SCORE_LEVEL_CLEAR + Math.max(0, timeBonus);
      state.status = 'levelComplete';
      audio.win();
    }
  }
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawScene(ctx, state);
  drawHud(ctx, state);
  if (state.status === 'levelComplete') {
    drawPanel(ctx, 'LEVEL SELESAI!', [
      `${state.levelDef.name} — loot ${state.loots.length}/${state.loots.length} dibawa kabur`,
      `Skor: ${state.score}   •   Waktu: ${fmtTime(state.time)} (par ${fmtTime(state.levelDef.par)})`,
      state.level >= LEVEL_COUNT ? 'Semua galeri dibobol. Tekan Enter untuk layar menang.' : 'Tekan Enter untuk level berikutnya.',
    ], '#37c978');
  } else if (state.status === 'caught') {
    drawPanel(ctx, 'KETANGKAP!', [
      'Alarm penuh dan guard menangkapmu di tengah galeri.',
      `Skor: ${state.score}   •   Loot kembali ke etalase.`,
      'Tekan Enter untuk mengulang level ini.',
    ], '#e5484d');
  } else if (state.status === 'won') {
    drawPanel(ctx, 'PENCURIAN SEMPURNA!', [
      'Semua galeri dibobol, semua loot dibawa kabur.',
      `Skor akhir: ${state.score}   •   Total waktu: ${fmtTime(totalTime + state.time)}`,
      'VAULTLINE — terima kasih sudah bermain. Tekan Enter untuk main lagi.',
    ], '#f5c542');
  }
}

// ---- Self-test (?selftest=1): mainkan 1 level penuh secara otomatis.
// Ster pemain menuju loot terdekat lalu exit, langkah demi langkah,
// memakai update() yang sama dengan game nyata. Hasil ditulis ke DOM.
function runSelfTest() {
  const results = [];
  const log = (name, ok, detail) => results.push({ name, ok, detail });

  // 1. Alarm naik saat berdiri di depan guard.
  const t1 = newState(1);
  const g0 = t1.guards[0];
  // Guard 1 mulai di (520,130) menuju waypoint (520,400): arah hadap ke
  // bawah (PI/2). Taruh pemain 60px di depannya, di dalam cone.
  t1.player.x = g0.x;
  t1.player.y = g0.y + 60;
  const alarmBefore = t1.alarm;
  const saved = state;
  state = t1;
  for (let i = 0; i < 30; i++) update(1 / 60);
  log('alarm-rises-in-cone', t1.alarm > alarmBefore + 5, `alarm ${alarmBefore.toFixed(1)} -> ${t1.alarm.toFixed(1)}`);
  state = saved;

  // 2. Autopilot: kumpulkan semua loot lalu ke exit.
  // Pathfinding BFS di grid kasar (32px) supaya tidak nyangkut di dinding.
  const t2 = newState(1);
  state = t2;
  const CELL = 32;
  const COLS = Math.ceil(VIEW_W / CELL);
  const ROWS = Math.ceil(VIEW_H / CELL);
  const cellBlocked = (cx, cy) => {
    const x = cx * CELL + CELL / 2;
    const y = cy * CELL + CELL / 2;
    if (y < 56 + 12) return true; // jangan masuk bar HUD
    for (const w of t2.levelDef.walls) {
      if (x + 13 > w.x && x - 13 < w.x + w.w && y + 13 > w.y && y - 13 < w.y + w.h) return true;
    }
    return false;
  };
  const findPath = (sx, sy, tx, ty) => {
    const scx = Math.max(0, Math.min(COLS - 1, Math.floor(sx / CELL)));
    const scy = Math.max(0, Math.min(ROWS - 1, Math.floor(sy / CELL)));
    const tcx = Math.max(0, Math.min(COLS - 1, Math.floor(tx / CELL)));
    const tcy = Math.max(0, Math.min(ROWS - 1, Math.floor(ty / CELL)));
    const key = (x, y) => `${x},${y}`;
    const prev = new Map();
    const queue = [[scx, scy]];
    prev.set(key(scx, scy), null);
    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      if (cx === tcx && cy === tcy) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        if (prev.has(key(nx, ny)) || cellBlocked(nx, ny)) continue;
        prev.set(key(nx, ny), [cx, cy]);
        queue.push([nx, ny]);
      }
    }
    if (!prev.has(key(tcx, tcy))) return null;
    const path = [];
    let cur = [tcx, tcy];
    while (cur) {
      path.unshift([cur[0] * CELL + CELL / 2, cur[1] * CELL + CELL / 2]);
      cur = prev.get(key(cur[0], cur[1]));
    }
    return path;
  };
  let steps = 0;
  let ok = true;
  let path = null;
  let pathTarget = '';
  while (steps < 60 * 180) {
    steps++;
    const remaining = t2.loots.filter((l) => !l.taken);
    let tx, ty, tkey;
    if (remaining.length > 0) {
      remaining.sort((a, b) => Math.hypot(a.x - t2.player.x, a.y - t2.player.y) - Math.hypot(b.x - t2.player.x, b.y - t2.player.y));
      tx = remaining[0].x; ty = remaining[0].y; tkey = `loot${remaining[0].x},${remaining[0].y}`;
    } else {
      tx = t2.levelDef.exit.x + 28; ty = t2.levelDef.exit.y + 28; tkey = 'exit';
    }
    if (!path || pathTarget !== tkey || steps % 90 === 0) {
      path = findPath(t2.player.x, t2.player.y, tx, ty);
      pathTarget = tkey;
    }
    // Ikuti waypoint path; waypoint terakhir = target persis.
    let wx = tx;
    let wy = ty;
    if (path && path.length > 1) {
      // Lewati waypoint yang sudah dekat.
      while (path.length > 1 && Math.hypot(path[0][0] - t2.player.x, path[0][1] - t2.player.y) < 14) path.shift();
      wx = path[0][0];
      wy = path[0][1];
    }
    const p = t2.player;
    const d = Math.hypot(wx - p.x, wy - p.y);
    const sp = 165 * (1 - Math.min(p.lootCarried * 0.06, 0.18)) * (1 / 60);
    if (d > 4) {
      const ux = (wx - p.x) / d;
      const uy = (wy - p.y) / d;
      const nx = p.x + ux * sp;
      const ny = p.y + uy * sp;
      let blocked = false;
      for (const w of t2.levelDef.walls) {
        if (nx + p.r > w.x && nx - p.r < w.x + w.w && ny + p.r > w.y && ny - p.r < w.y + w.h) { blocked = true; break; }
      }
      if (!blocked) {
        p.x = nx;
        p.y = ny;
        p.dir = Math.atan2(uy, ux);
      }
    }
    update(1 / 60);
    if (t2.status === 'levelComplete') break;
    if (t2.status === 'caught') { ok = false; break; }
  }
  log('autopilot-level1-complete', t2.status === 'levelComplete', `status=${t2.status} steps=${steps} score=${t2.score} loot=${t2.loots.filter((l) => l.taken).length}/${t2.loots.length}`);
  log('autopilot-not-caught', ok, ok ? 'tidak ketangkap' : 'ketangkap saat autopilot');
  state = saved;

  const pass = results.every((r) => r.ok);
  const div = document.getElementById('selftest');
  div.textContent = `SELFTEST ${pass ? 'PASS' : 'FAIL'} :: ` + results.map((r) => `${r.name}=${r.ok ? 'OK' : 'FAIL'}(${r.detail})`).join(' | ');
  document.title = `SELFTEST ${pass ? 'PASS' : 'FAIL'}`;
  render();
}

// ---- Boot.
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
if (params.get('selftest') === '1') {
  runSelfTest();
} else {
  const shotLevel = shotName === 'level3' || shotName === 'win' ? 3 : 1;
  if (shotLevel === 3) state = newState(3);
  if (shotName) applyShot(state, shotName);
  render();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
