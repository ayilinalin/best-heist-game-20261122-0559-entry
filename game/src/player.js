// VAULTLINE — player.js
// Pencuri: gerak WASD/panah + klik-untuk-bergerak, tabrakan dinding,
// ambil loot (makin berat makin lambat), dan lempar smoke pellet.

import {
  PLAYER_R,
  PLAYER_SPEED,
  CARRY_SLOW_PER_LOOT,
  CARRY_SLOW_MAX,
  SCORE_PER_LOOT,
} from './config.js';

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    r: PLAYER_R,
    dir: 0, // arah hadap, radian
    lootCarried: 0,
    smokesLeft: 2,
    moving: false,
  };
}

export function playerSpeed(player) {
  const slow = Math.min(player.lootCarried * CARRY_SLOW_PER_LOOT, CARRY_SLOW_MAX);
  return PLAYER_SPEED * (1 - slow);
}

// Geser lingkaran sepanjang sumbu, tolak bila menabrak dinding.
function moveAxis(p, dx, dy, walls) {
  const nx = p.x + dx;
  const ny = p.y + dy;
  for (const w of walls) {
    if (
      nx + p.r > w.x &&
      nx - p.r < w.x + w.w &&
      ny + p.r > w.y &&
      ny - p.r < w.y + w.h
    ) {
      return false;
    }
  }
  p.x = nx;
  p.y = ny;
  return true;
}

export function updatePlayer(player, input, walls, dt) {
  let vx = 0;
  let vy = 0;
  if (input.left) vx -= 1;
  if (input.right) vx += 1;
  if (input.up) vy -= 1;
  if (input.down) vy += 1;
  // Klik-untuk-bergerak: mouse memberi target bila tidak ada tombol keyboard.
  if (vx === 0 && vy === 0 && input.target) {
    const dx = input.target.x - player.x;
    const dy = input.target.y - player.y;
    const d = Math.hypot(dx, dy);
    if (d > 6) {
      vx = dx / d;
      vy = dy / d;
    } else {
      input.target = null;
    }
  }
  const len = Math.hypot(vx, vy);
  player.moving = len > 0;
  if (!player.moving) return;
  vx /= len;
  vy /= len;
  player.dir = Math.atan2(vy, vx);
  const sp = playerSpeed(player) * dt;
  // Gerak per-sumbu supaya bisa meluncur menyusuri dinding.
  moveAxis(player, vx * sp, 0, walls);
  moveAxis(player, 0, vy * sp, walls);
}

// Ambil loot yang tersentuh. Kembalikan loot yang baru diambil (atau null).
export function tryPickup(player, loots, onScore) {
  for (const loot of loots) {
    if (loot.taken) continue;
    const d = Math.hypot(loot.x - player.x, loot.y - player.y);
    if (d < player.r + 16) {
      loot.taken = true;
      player.lootCarried += 1;
      if (onScore) onScore(SCORE_PER_LOOT);
      return loot;
    }
  }
  return null;
}

// Apakah pemain berdiri di zona bayangan?
export function inShadow(player, shadows) {
  for (const s of shadows) {
    if (player.x > s.x && player.x < s.x + s.w && player.y > s.y && player.y < s.y + s.h) {
      return true;
    }
  }
  return false;
}
