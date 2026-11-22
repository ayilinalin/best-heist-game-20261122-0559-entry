// VAULTLINE — render.js
// Semua gambar di canvas: lantai galeri, bayangan, dinding/etalase,
// loot, exit, guard + vision cone kuning, kamera + garis pandang merah,
// pencuri, dan awan asap. Warna dibedakan sekilas: aman = gelap,
// bahaya = kuning/merah, loot = emas berkilau.

import { VIEW_W, VIEW_H, HUD_H, GUARD_CONE_RANGE, GUARD_CONE_HALF, CAMERA_RANGE, CAMERA_CONE_HALF } from './config.js';

const LOOT_STYLE = {
  diamond: { color: '#7fe7ff', label: '◆' },
  artifact: { color: '#c99aff', label: '❖' },
  gold: { color: '#ffd75e', label: '▣' },
  painting: { color: '#ff9d5c', label: '▤' },
};

function drawCone(ctx, x, y, dir, range, half, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - half, dir + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawScene(ctx, s) {
  // Lantai galeri: papan gelap + ubin samar.
  ctx.fillStyle = '#232030';
  ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H - HUD_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= VIEW_W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, HUD_H);
    ctx.lineTo(x, VIEW_H);
    ctx.stroke();
  }
  for (let y = HUD_H; y <= VIEW_H; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  // Karpet tengah (rute utama).
  ctx.fillStyle = '#2e2438';
  ctx.fillRect(40, 200, 1200, 84);

  // Zona bayangan: gelap, aman dari deteksi jarak jauh.
  for (const sh of s.levelDef.shadows) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(sh.x, sh.y, sh.w, sh.h);
    ctx.strokeStyle = 'rgba(127, 231, 255, 0.35)';
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(sh.x + 0.5, sh.y + 0.5, sh.w - 1, sh.h - 1);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(127, 231, 255, 0.55)';
    ctx.font = '11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BAYANGAN — aman', sh.x + 8, sh.y + 16);
  }

  // Exit: pintu hijau, terkunci sampai semua loot diambil.
  const ex = s.levelDef.exit;
  const open = s.loots.every((l) => l.taken);
  ctx.fillStyle = open ? '#1f7a44' : '#3a3a48';
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.strokeStyle = open ? '#37c978' : '#77778a';
  ctx.lineWidth = 3;
  ctx.strokeRect(ex.x + 1.5, ex.y + 1.5, ex.w - 3, ex.h - 3);
  ctx.fillStyle = open ? '#b6ffd6' : '#a9a9bb';
  ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT' : 'KUNCI', ex.x + ex.w / 2, ex.y + ex.h / 2 + 4);
  ctx.fillStyle = '#e8e8f0';
  ctx.font = '11px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(open ? 'Kabur!' : 'Ambil semua loot dulu', VIEW_W - 10, ex.y + ex.h + 14);

  // Dinding / etalase.
  for (const w of s.levelDef.walls) {
    ctx.fillStyle = '#4a4458';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#5d5670';
    ctx.fillRect(w.x, w.y, w.w, 4);
  }

  // Loot: pedestal + ikon berkilau.
  for (const loot of s.loots) {
    if (loot.taken) continue;
    const st = LOOT_STYLE[loot.kind];
    ctx.fillStyle = '#17141f';
    ctx.beginPath();
    ctx.arc(loot.x, loot.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = st.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = st.color;
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.label, loot.x, loot.y + 1);
    ctx.font = '11px "Trebuchet MS", sans-serif';
    ctx.fillText(loot.kind.toUpperCase(), loot.x, loot.y + 28);
    ctx.textBaseline = 'alphabetic';
  }

  // Vision cone guard (kuning) — digambar sebelum guard.
  for (const g of s.guards) {
    drawCone(ctx, g.x, g.y, g.dir, GUARD_CONE_RANGE, GUARD_CONE_HALF, g.chasing ? 'rgba(229, 72, 77, 0.30)' : 'rgba(245, 197, 66, 0.22)');
  }
  // Cone kamera (merah).
  for (const cam of s.cameras) {
    drawCone(ctx, cam.x, cam.y, cam.angle, CAMERA_RANGE, CAMERA_CONE_HALF, 'rgba(229, 72, 77, 0.16)');
    ctx.strokeStyle = 'rgba(229, 72, 77, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cam.x, cam.y);
    ctx.lineTo(cam.x + Math.cos(cam.angle) * CAMERA_RANGE, cam.y + Math.sin(cam.angle) * CAMERA_RANGE);
    ctx.stroke();
  }

  // Guard: badan + arah hadap.
  for (const g of s.guards) {
    ctx.fillStyle = g.chasing ? '#e5484d' : '#e8a33d';
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a22';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#1a1a22';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.dir) * 6, g.y + Math.sin(g.dir) * 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GUARD', g.x, g.y - g.r - 8);
  }

  // Kamera: kotak kecil di dinding + lensa.
  for (const cam of s.cameras) {
    ctx.fillStyle = '#3d3d4d';
    ctx.fillRect(cam.x - 9, cam.y - 9, 18, 18);
    ctx.strokeStyle = '#e5484d';
    ctx.lineWidth = 2;
    ctx.strokeRect(cam.x - 9.5, cam.y - 9.5, 19, 19);
    ctx.fillStyle = '#ff5c5c';
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 5, cam.y + Math.sin(cam.angle) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb3b3';
    ctx.font = 'bold 10px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAM', cam.x, cam.y - 14);
  }

  // Pencuri: sosok hitam bertopi + penanda arah.
  const p = s.player;
  ctx.fillStyle = '#0d0d12';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.dir) * 6, p.y + Math.sin(p.dir) * 6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PENCURI', p.x, p.y - p.r - 8);
  if (p.lootCarried > 0) {
    ctx.fillStyle = '#ffd75e';
    ctx.font = '11px "Trebuchet MS", sans-serif';
    ctx.fillText(`membawa ${p.lootCarried} loot — lebih lambat`, p.x, p.y + p.r + 14);
  }

  // Awan asap.
  if (s.smoke && s.smoke.active) {
    ctx.fillStyle = 'rgba(200, 200, 210, 0.35)';
    ctx.beginPath();
    ctx.arc(s.smoke.x, s.smoke.y, s.smoke.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASAP', s.smoke.x, s.smoke.y);
  }

  // Petunjuk kontrol di bawah (hanya saat bermain).
  if (s.status === 'playing' && !s.frozen) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '12px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('WASD/panah bergerak • klik = jalan ke titik • Space/klik kanan = smoke • M = mute', 12, VIEW_H - 10);
  }
}
