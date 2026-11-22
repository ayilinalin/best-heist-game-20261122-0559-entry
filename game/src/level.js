// VAULTLINE — level.js
// Data ruangan per level: dinding (cover), zona bayangan, patroli guard,
// kamera, loot, exit, dan posisi start pencuri. Tiga level, kesulitan naik:
// lebih banyak guard + kamera, ruangan lebih padat, loot lebih banyak.
//
// Koordinat dalam ruang 1280x480; playfield mulai di y=56 (di bawah HUD).
// Dinding adalah rect {x, y, w, h}; bayangan rect {x, y, w, h}.
// Guard: {x, y, waypoints: [[x,y], ...], speed?}
// Kamera: {x, y, base (radian), sweep (radian), speed?} — dipasang di dinding.
// Loot: {x, y, kind: 'diamond'|'artifact'|'gold'|'painting'}

export function buildLevel(n) {
  if (n === 1) {
    return {
      name: 'Level 1 — Galeri Senja',
      par: 75,
      start: { x: 70, y: 420 },
      exit: { x: 1190, y: 90, w: 56, h: 56 },
      walls: [
        { x: 0, y: 56, w: 1280, h: 10 }, // dinding atas
        { x: 0, y: 470, w: 1280, h: 10 }, // dinding bawah
        { x: 0, y: 56, w: 10, h: 424 },
        { x: 1270, y: 56, w: 10, h: 424 },
        { x: 300, y: 150, w: 26, h: 190 }, // etalase tengah kiri
        { x: 640, y: 90, w: 26, h: 150 }, // etalase tengah
        { x: 640, y: 330, w: 26, h: 110 },
        { x: 960, y: 180, w: 26, h: 190 }, // etalase kanan
        { x: 430, y: 380, w: 180, h: 22 }, // meja rendah
        { x: 880, y: 80, w: 150, h: 22 },
      ],
      shadows: [
        { x: 180, y: 300, w: 150, h: 120 },
        { x: 720, y: 300, w: 170, h: 110 },
        { x: 1060, y: 330, w: 150, h: 100 },
      ],
      guards: [
        { x: 520, y: 130, waypoints: [[520, 130], [520, 400], [850, 400], [850, 130]] },
        { x: 1050, y: 400, waypoints: [[1050, 400], [1050, 120], [1180, 120], [1180, 400]] },
      ],
      cameras: [
        { x: 326, y: 66, base: Math.PI / 2, sweep: 1.1 },
        { x: 986, y: 66, base: Math.PI / 2, sweep: 1.0 },
      ],
      loots: [
        { x: 480, y: 110, kind: 'diamond' },
        { x: 800, y: 430, kind: 'artifact' },
        { x: 1150, y: 250, kind: 'gold' },
      ],
    };
  }
  if (n === 2) {
    return {
      name: 'Level 2 — Ruang Permata',
      par: 95,
      start: { x: 70, y: 90 },
      exit: { x: 1190, y: 420, w: 56, h: 56 },
      walls: [
        { x: 0, y: 56, w: 1280, h: 10 },
        { x: 0, y: 470, w: 1280, h: 10 },
        { x: 0, y: 56, w: 10, h: 424 },
        { x: 1270, y: 56, w: 10, h: 424 },
        { x: 240, y: 120, w: 26, h: 200 },
        { x: 240, y: 380, w: 200, h: 22 },
        { x: 560, y: 90, w: 26, h: 170 },
        { x: 560, y: 330, w: 26, h: 120 },
        { x: 820, y: 150, w: 26, h: 200 },
        { x: 1010, y: 90, w: 200, h: 22 },
        { x: 1010, y: 400, w: 200, h: 22 },
      ],
      shadows: [
        { x: 120, y: 330, w: 150, h: 110 },
        { x: 620, y: 90, w: 150, h: 110 },
        { x: 880, y: 330, w: 140, h: 100 },
        { x: 1120, y: 180, w: 110, h: 130 },
      ],
      guards: [
        { x: 400, y: 130, waypoints: [[400, 130], [400, 420], [700, 420], [700, 130]] },
        { x: 950, y: 420, waypoints: [[950, 420], [950, 130], [1180, 130], [1180, 420]] },
        { x: 700, y: 250, waypoints: [[700, 250], [950, 250], [950, 380], [700, 380]] },
      ],
      cameras: [
        { x: 266, y: 66, base: Math.PI / 2, sweep: 1.2 },
        { x: 586, y: 66, base: Math.PI / 2, sweep: 1.1 },
        { x: 846, y: 66, base: Math.PI / 2, sweep: 1.0 },
      ],
      loots: [
        { x: 350, y: 430, kind: 'diamond' },
        { x: 680, y: 110, kind: 'artifact' },
        { x: 940, y: 250, kind: 'gold' },
        { x: 1150, y: 330, kind: 'painting' },
      ],
    };
  }
  // Level 3 — Bilik Mahkota: paling padat, 4 guard, 4 kamera.
  return {
    name: 'Level 3 — Bilik Mahkota',
    par: 120,
    start: { x: 70, y: 420 },
    exit: { x: 1190, y: 90, w: 56, h: 56 },
    walls: [
      { x: 0, y: 56, w: 1280, h: 10 },
      { x: 0, y: 470, w: 1280, h: 10 },
      { x: 0, y: 56, w: 10, h: 424 },
      { x: 1270, y: 56, w: 10, h: 424 },
      { x: 210, y: 110, w: 26, h: 180 },
      { x: 210, y: 360, w: 220, h: 22 },
      { x: 470, y: 90, w: 26, h: 160 },
      { x: 470, y: 330, w: 26, h: 120 },
      { x: 700, y: 110, w: 26, h: 180 },
      { x: 700, y: 360, w: 220, h: 22 },
      { x: 950, y: 90, w: 26, h: 160 },
      { x: 950, y: 330, w: 26, h: 120 },
      { x: 1080, y: 200, w: 130, h: 22 },
    ],
    shadows: [
      { x: 90, y: 120, w: 120, h: 130 },
      { x: 520, y: 330, w: 150, h: 100 },
      { x: 780, y: 90, w: 140, h: 110 },
      { x: 1020, y: 330, w: 150, h: 100 },
      { x: 1150, y: 180, w: 90, h: 130 },
    ],
    guards: [
      { x: 350, y: 120, waypoints: [[350, 120], [350, 420], [600, 420], [600, 120]] },
      { x: 850, y: 420, waypoints: [[850, 420], [850, 120], [1100, 120], [1100, 420]] },
      { x: 600, y: 250, waypoints: [[600, 250], [850, 250], [850, 400], [600, 400]] },
      { x: 1150, y: 250, waypoints: [[1150, 250], [1150, 430], [980, 430], [980, 250]] },
    ],
    cameras: [
      { x: 236, y: 66, base: Math.PI / 2, sweep: 1.25 },
      { x: 496, y: 66, base: Math.PI / 2, sweep: 1.15 },
      { x: 726, y: 66, base: Math.PI / 2, sweep: 1.2 },
      { x: 976, y: 66, base: Math.PI / 2, sweep: 1.05 },
    ],
    loots: [
      { x: 320, y: 430, kind: 'diamond' },
      { x: 580, y: 110, kind: 'artifact' },
      { x: 830, y: 430, kind: 'gold' },
      { x: 1100, y: 130, kind: 'painting' },
    ],
  };
}
