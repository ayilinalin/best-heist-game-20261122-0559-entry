// VAULTLINE — hud.js
// Bar HUD atas canvas: judul + level, alarm meter (tengah, besar dan
// jelas), loot, skor, timer, dan sisa smoke. Semua digambar di canvas
// supaya ikut tampil di screenshot.

import { VIEW_W, HUD_H } from './config.js';

export function drawHud(ctx, s) {
  // Latar bar.
  ctx.fillStyle = '#101018';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(0, HUD_H - 3, VIEW_W, 3);

  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5c542';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VAULTLINE', 14, HUD_H / 2 - 1);
  ctx.fillStyle = '#c9c9d6';
  ctx.font = '13px "Trebuchet MS", sans-serif';
  ctx.fillText(s.levelDef.name, 150, HUD_H / 2 - 1);

  // Alarm meter — tengah, lebar 340px, warna hijau -> kuning -> merah.
  const ax = 470;
  const ay = 16;
  const aw = 340;
  const ah = 22;
  ctx.fillStyle = '#1d1d28';
  ctx.fillRect(ax - 2, ay - 2, aw + 4, ah + 4);
  const frac = s.alarm / 100;
  const alarmColor = frac < 0.45 ? '#37c978' : frac < 0.8 ? '#f5c542' : '#e5484d';
  ctx.fillStyle = alarmColor;
  ctx.fillRect(ax, ay, aw * frac, ah);
  // Garis penanda 100% (ambang kejar).
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax + 0.5, ay + 0.5, aw - 1, ah - 1);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, ay - 9 + 22);
  ctx.fillStyle = frac >= 0.8 ? '#ff6b6b' : '#c9c9d6';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillText(`${Math.round(s.alarm)}%`, ax + aw + 10, HUD_H / 2);
  if (s.chase) {
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
    ctx.fillText('!! KEJAR !!', ax + aw + 62, HUD_H / 2);
  }

  // Kanan: loot, skor, timer, smoke.
  const total = s.loots.length;
  const got = s.loots.filter((l) => l.taken).length;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd75e';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillText(`LOOT ${got}/${total}`, 1000, HUD_H / 2 - 11);
  ctx.fillStyle = '#c9c9d6';
  ctx.font = '13px "Trebuchet MS", sans-serif';
  ctx.fillText(`SMOKE x${s.player.smokesLeft} (Space)`, 1000, HUD_H / 2 + 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Trebuchet MS", sans-serif';
  ctx.fillText(`SKOR ${s.score}`, 1266, HUD_H / 2 - 11);
  ctx.fillStyle = '#c9c9d6';
  ctx.font = '13px "Trebuchet MS", sans-serif';
  ctx.fillText(fmtTime(s.time), 1266, HUD_H / 2 + 12);
}

export function fmtTime(t) {
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Panel tengah layar untuk menang/kalah/level selesai.
export function drawPanel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8, 8, 14, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, 480);
  const pw = 560;
  const ph = 110 + lines.length * 30;
  const px = (VIEW_W - pw) / 2;
  const py = (480 - ph) / 2;
  ctx.fillStyle = '#16161f';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(px + 1.5, py + 1.5, pw - 3, ph - 3);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.fillText(title, VIEW_W / 2, py + 46);
  ctx.fillStyle = '#e8e8f0';
  ctx.font = '16px "Trebuchet MS", sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_W / 2, py + 88 + i * 30);
  });
  ctx.fillStyle = '#9a9aad';
  ctx.font = '13px "Trebuchet MS", sans-serif';
  ctx.fillText('Tekan Enter untuk lanjut  •  R untuk ulang level', VIEW_W / 2, py + ph - 20);
}
