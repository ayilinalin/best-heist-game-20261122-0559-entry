// VAULTLINE — config.js
// Satu-satunya sumber konstanta tuning game: ukuran canvas, HUD, alarm,
// kecepatan, dan jangkauan penglihatan. Tidak ada import di sini.

export const VIEW_W = 1280;
export const VIEW_H = 480;
export const HUD_H = 56;

// Playfield: area ruangan di bawah bar HUD.
export const FIELD = { x: 0, y: HUD_H, w: VIEW_W, h: VIEW_H - HUD_H };

// Pemain (pencuri).
export const PLAYER_R = 11;
export const PLAYER_SPEED = 165; // px/detik tanpa beban
export const CARRY_SLOW_PER_LOOT = 0.06; // -6% per loot yang dibawa
export const CARRY_SLOW_MAX = 0.18;

// Alarm meter 0..100.
export const ALARM_GUARD_RATE = 46; // naik/detik saat terlihat guard
export const ALARM_CAMERA_RATE = 62; // naik/detik saat terlihat kamera
export const ALARM_DECAY_RATE = 20; // turun/detik saat bersembunyi
export const ALARM_CHASE_DECAY = 9; // turun/detik saat mode kejar
export const ALARM_CHASE_END = 55; // kejar berakhir di bawah nilai ini
export const ALARM_CHASE_AT = 100; // penuh -> guard mengejar

// Guard.
export const GUARD_R = 12;
export const GUARD_PATROL_SPEED = 62;
export const GUARD_CHASE_SPEED = 128;
export const GUARD_CONE_RANGE = 175;
export const GUARD_CONE_HALF = 0.56; // radian, setengah sudut cone
export const GUARD_CATCH_R = 20; // jarak tangkap saat mengejar

// Kamera pengawas.
export const CAMERA_RANGE = 215;
export const CAMERA_CONE_HALF = 0.34;
export const CAMERA_SWEEP_SPEED = 0.55; // radian/detik

// Bayangan (shadow zone): jangkauan deteksi di dalamnya tinggal 45%.
export const SHADOW_RANGE_FACTOR = 0.45;

// Smoke pellet: alat sekali pakai yang membutakan penglihatan.
export const SMOKE_R = 78;
export const SMOKE_DURATION = 3.2; // detik
export const SMOKES_PER_LEVEL = 2;

// Skor.
export const SCORE_PER_LOOT = 250;
export const SCORE_LEVEL_CLEAR = 400;
export const SCORE_TIME_BONUS_MAX = 300;

export const LEVEL_COUNT = 3;
export const LOOT_NAMES = ['Berlian', 'Artefak', 'Emas', 'Lukisan'];
