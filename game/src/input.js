// VAULTLINE — input.js
// Keyboard (WASD/panah) + mouse (klik-untuk-bergerak, klik kanan/Space
// untuk smoke). Menahan state tombol; main.js membaca tiap frame.

export function createInput(canvas, callbacks) {
  const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    target: null, // {x, y} tujuan klik
    smokeQueued: false,
    anyKey: false,
  };

  const KEYMAP = {
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
  };

  window.addEventListener('keydown', (e) => {
    const field = KEYMAP[e.code];
    if (field) {
      input[field] = true;
      input.target = null; // keyboard mengalahkan target klik
      input.anyKey = true;
      e.preventDefault();
    } else if (e.code === 'Space') {
      input.smokeQueued = true;
      input.anyKey = true;
      e.preventDefault();
    } else if (e.code === 'Enter' || e.code === 'KeyR') {
      if (callbacks.onConfirm) callbacks.onConfirm();
    } else if (e.code === 'KeyM') {
      if (callbacks.onMute) callbacks.onMute();
    }
  });
  window.addEventListener('keyup', (e) => {
    const field = KEYMAP[e.code];
    if (field) input[field] = false;
  });

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    if (e.button === 2) {
      input.smokeQueued = true; // klik kanan = smoke di posisi pemain
    } else {
      input.target = { x, y };
    }
    input.anyKey = true;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  return input;
}
