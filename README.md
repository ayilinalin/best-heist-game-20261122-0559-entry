# VAULTLINE — Pencurian Galeri Tengah Malam

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/ayilinalin/best-heist-game-20261122-0559-entry/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/ayilinalin/best-heist-game-20261122-0559-entry/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

Game heist top-down original untuk kompetisi make.fun **"Make the best heist game"** (pool $50, deadline 23 Nov 2026 00:59 WIB).

## Cara main

Kamu pencuri yang membobol galeri tengah malam. Seberangi ruangan, ambil semua loot (berlian, artefak, emas, lukisan), lalu kabur lewat pintu exit — tanpa ketahuan guard dan kamera pengawas.

- **Gerak:** WASD / panah, atau klik di mana saja untuk jalan ke titik itu.
- **Guard:** berpatroli dengan vision cone kuning. Terlihat = alarm naik.
- **Kamera:** menyapu ruangan, garis pandang merah. Terlihat kamera = alarm naik lebih cepat.
- **Alarm meter:** naik saat terlihat, turun saat bersembunyi. Penuh (100%) = guard mengejar; kalau tertangkap, misi gagal.
- **Bayangan:** berdiri di zona bayangan untuk memangkas jangkauan deteksi.
- **Smoke pellet:** `Space` / klik kanan — asap 3 detik yang membutakan penglihatan, 2x per level.
- **Loot:** tiap loot +250 skor tapi membuatmu sedikit lebih lambat. Ambil semua loot untuk membuka exit.
- **3 level:** Galeri Senja, Ruang Permata, Bilik Mahkota — makin banyak guard dan kamera.

## Jalankan

Buka `game/index.html` di desktop Chrome, atau serve folder `game/` dengan server statis apa pun. Tanpa build step, tanpa network, tanpa library eksternal. Suara prosedural WebAudio (tanpa file eksternal); `M` untuk mute.

## Struktur

- `game/index.html` — halaman game (canvas 1280×480)
- `game/src/main.js` — loop + state machine + self-test
- `game/src/level.js` — data 3 level (ruangan, guard, kamera, loot)
- `game/src/guard.js` — patroli, vision cone, line-of-sight
- `game/src/camera.js` — kamera berputar + deteksi
- `game/src/player.js` — gerak, tabrakan, ambil loot
- `game/src/render.js` — gambar ruangan + semua entitas
- `game/src/hud.js` — alarm meter, loot, skor, timer
- `game/src/audio.js` — suara WebAudio prosedural
- `game/src/input.js` — keyboard + mouse
- `game/src/shots.js` — staging deterministik untuk screenshot
- `main.ts` — entrypoint: menyalin `game/` + `screenshots/` ke output dan menulis `dossier.json`
- `vendor/makefun-game.ts` — library dossier make.fun (copy kit, tanpa diubah)

## Lisensi

MIT — lihat `LICENSE`.
