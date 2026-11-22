// VAULTLINE — shots.js
// Staging deterministik untuk screenshot: dari ?shot=<nama>, atur state
// game ke satu frame yang menampilkan semua elemen kunci, lalu bekukan
// (frozen) supaya render stabil untuk headless Chromium.
//
//   cover  — Level 1 penuh: pencuri di start, guard+cone, kamera, loot,
//            alarm 0%.
//   mid    — Level 1, pencuri dekat loot, alarm 45%, cone guard dekat.
//   level3 — Level 3: 4 guard + 4 kamera, alarm 30%.
//   win    — Layar menang level 3: loot lengkap + skor.

export function applyShot(state, name) {
  const { levelDef, player, guards, cameras, loots } = state;
  state.frozen = true;
  if (name === 'cover') {
    player.x = levelDef.start.x;
    player.y = levelDef.start.y;
    player.dir = 0.3;
    state.alarm = 0;
    guards[0].x = 520; guards[0].y = 260; guards[0].dir = -0.5;
    guards[1].x = 1080; guards[1].y = 250; guards[1].dir = Math.PI;
    cameras[0].angle = Math.PI / 2 + 0.4;
    cameras[1].angle = Math.PI / 2 - 0.5;
    return true;
  }
  if (name === 'mid') {
    // Pencuri sudah ambil 1 loot, berdiri dekat loot kedua; alarm 45%.
    loots[0].taken = true;
    player.lootCarried = 1;
    player.x = 760; player.y = 400; player.dir = -1.2;
    state.alarm = 45;
    guards[0].x = 700; guards[0].y = 330; guards[0].dir = 0.9;
    guards[1].x = 1050; guards[1].y = 300; guards[1].dir = Math.PI * 0.75;
    cameras[0].angle = Math.PI / 2 + 0.6;
    return true;
  }
  if (name === 'level3') {
    player.x = 600; player.y = 300; player.dir = 0.8;
    state.alarm = 30;
    guards[0].x = 480; guards[0].y = 200; guards[0].dir = 1.4;
    guards[1].x = 950; guards[1].y = 300; guards[1].dir = -2.2;
    guards[2].x = 720; guards[2].y = 380; guards[2].dir = -0.6;
    guards[3].x = 1080; guards[3].y = 200; guards[3].dir = 2.6;
    cameras[0].angle = Math.PI / 2 + 0.5;
    cameras[1].angle = Math.PI / 2 - 0.4;
    cameras[2].angle = Math.PI / 2 + 0.9;
    cameras[3].angle = Math.PI / 2 - 0.8;
    return true;
  }
  if (name === 'win') {
    for (const l of loots) l.taken = true;
    player.lootCarried = loots.length;
    player.x = levelDef.exit.x + 10;
    player.y = levelDef.exit.y + 28;
    state.alarm = 12;
    state.score = 2450;
    state.time = 96;
    state.status = 'won';
    return true;
  }
  return false;
}
