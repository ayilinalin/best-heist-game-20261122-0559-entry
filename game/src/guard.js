// VAULTLINE — guard.js
// Guard berpatroli di waypoint, vision cone mengikuti arah hadapnya,
// dan mengejar pencuri saat alarm penuh. Deteksi memakai garis pandang
// (line-of-sight) yang terhalang dinding dan asap.

import {
  GUARD_R,
  GUARD_PATROL_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_CONE_RANGE,
  GUARD_CONE_HALF,
  GUARD_CATCH_R,
  SHADOW_RANGE_FACTOR,
} from './config.js';

export function createGuard(def) {
  return {
    x: def.x,
    y: def.y,
    r: GUARD_R,
    waypoints: def.waypoints,
    wp: 1,
    dir: 0,
    speed: def.speed || GUARD_PATROL_SPEED,
    chasing: false,
    wait: 0,
  };
}

function blockedBySmoke(x1, y1, x2, y2, smoke) {
  if (!smoke || !smoke.active) return false;
  // Garis pandang putus bila titik tengah segmen masuk awan asap.
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return Math.hypot(mx - smoke.x, my - smoke.y) < smoke.r;
}

// Apakah segmen (x1,y1)-(x2,y2) memotong rect? Uji 4 sisi rect.
function segHitsRect(x1, y1, x2, y2, r) {
  const edges = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  for (const [ax, ay, bx, by] of edges) {
    if (segmentsCross(x1, y1, x2, y2, ax, ay, bx, by)) return true;
  }
  return false;
}

function segmentsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (d === 0) return false;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t > 0 && t < 1 && u > 0 && u < 1;
}

// Garis pandang bersih: tidak ada dinding di antara, tidak terhalang asap.
export function hasLineOfSight(x1, y1, x2, y2, walls, smoke) {
  if (blockedBySmoke(x1, y1, x2, y2, smoke)) return false;
  for (const w of walls) {
    if (segHitsRect(x1, y1, x2, y2, w)) return false;
  }
  return true;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Apakah guard melihat pemain? Bayangan memangkas jangkauan cone.
export function guardSees(guard, player, walls, shadows, smoke) {
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const dist = Math.hypot(dx, dy);
  let range = GUARD_CONE_RANGE;
  for (const s of shadows) {
    if (player.x > s.x && player.x < s.x + s.w && player.y > s.y && player.y < s.y + s.h) {
      range *= SHADOW_RANGE_FACTOR;
      break;
    }
  }
  if (dist > range) return false;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, guard.dir)) > GUARD_CONE_HALF) return false;
  return hasLineOfSight(guard.x, guard.y, player.x, player.y, walls, smoke);
}

export function updateGuard(guard, player, walls, dt, chase) {
  guard.chasing = chase;
  if (chase) {
    // Kejar: lari ke arah pemain, tabrakan dinding diabaikan sebagian
    // (guard mendorong menyusuri dinding via gerak per-sumbu).
    const dx = player.x - guard.x;
    const dy = player.y - guard.y;
    const d = Math.hypot(dx, dy) || 1;
    guard.dir = Math.atan2(dy, dx);
    const sp = GUARD_CHASE_SPEED * dt;
    guard.x += (dx / d) * sp;
    guard.y += (dy / d) * sp;
    return Math.hypot(player.x - guard.x, player.y - guard.y) < GUARD_CATCH_R;
  }
  if (guard.wait > 0) {
    guard.wait -= dt;
    return false;
  }
  const target = guard.waypoints[guard.wp];
  const dx = target[0] - guard.x;
  const dy = target[1] - guard.y;
  const d = Math.hypot(dx, dy);
  if (d < 6) {
    guard.wp = (guard.wp + 1) % guard.waypoints.length;
    guard.wait = 0.7; // jeda singkat di tiap titik, sempatkan pemain membaca cone
    return false;
  }
  guard.dir = Math.atan2(dy, dx);
  const sp = guard.speed * dt;
  guard.x += (dx / d) * sp;
  guard.y += (dy / d) * sp;
  return false;
}
