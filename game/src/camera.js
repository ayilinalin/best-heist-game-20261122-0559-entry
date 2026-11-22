// VAULTLINE — camera.js
// Kamera pengawas: terpasang di dinding, menyapu ruangan bolak-balik
// (garis pandang merah terlihat), mendeteksi pencuri lebih cepat dari guard.

import {
  CAMERA_RANGE,
  CAMERA_CONE_HALF,
  CAMERA_SWEEP_SPEED,
  SHADOW_RANGE_FACTOR,
} from './config.js';
import { hasLineOfSight } from './guard.js';

export function createCamera(def) {
  return {
    x: def.x,
    y: def.y,
    base: def.base,
    sweep: def.sweep,
    speed: def.speed || CAMERA_SWEEP_SPEED,
    angle: def.base,
    phase: Math.random() * Math.PI * 2,
    t: 0,
  };
}

export function updateCamera(cam, dt) {
  cam.t += dt;
  cam.angle = cam.base + Math.sin(cam.t * cam.speed + cam.phase) * cam.sweep;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Apakah kamera mendeteksi pemain? Sama seperti guard, tapi cone lebih
// sempit dan jangkauan lebih jauh; bayangan juga memangkasnya.
export function cameraSees(cam, player, walls, shadows, smoke) {
  const dx = player.x - cam.x;
  const dy = player.y - cam.y;
  const dist = Math.hypot(dx, dy);
  let range = CAMERA_RANGE;
  for (const s of shadows) {
    if (player.x > s.x && player.x < s.x + s.w && player.y > s.y && player.y < s.y + s.h) {
      range *= SHADOW_RANGE_FACTOR;
      break;
    }
  }
  if (dist > range) return false;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, cam.angle)) > CAMERA_CONE_HALF) return false;
  return hasLineOfSight(cam.x, cam.y, player.x, player.y, walls, smoke);
}
