// VAULTLINE — audio.js
// Suara prosedural WebAudio, tanpa file eksternal: langkah kaki, ambil
// loot, bunyi alarm, smoke, menang, dan ketangkap. AudioContext dibuat
// malas (setelah interaksi pertama) supaya tidak diblokir browser.

export function createAudio() {
  const audio = {
    ctx: null,
    muted: false,
    alarmOn: false,
    alarmNodes: null,
  };

  function ensure() {
    if (!audio.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        audio.ctx = new AC();
      } catch (err) {
        audio.ctx = null;
      }
    }
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
    return audio.ctx;
  }

  function tone(freq, dur, type, vol, when = 0) {
    if (audio.muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  audio.pickup = () => {
    tone(880, 0.12, 'sine', 0.16);
    tone(1318, 0.16, 'sine', 0.14, 0.07);
  };
  audio.smoke = () => {
    tone(220, 0.3, 'triangle', 0.12);
    tone(160, 0.35, 'triangle', 0.1, 0.08);
  };
  audio.win = () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'sine', 0.15, i * 0.11));
  };
  audio.caught = () => {
    tone(196, 0.5, 'sawtooth', 0.16);
    tone(147, 0.6, 'sawtooth', 0.14, 0.15);
  };
  audio.click = () => tone(660, 0.06, 'square', 0.06);

  // Sirene alarm berulang selama mode kejar; dipanggil tiap frame.
  audio.setAlarm = (on) => {
    if (on === audio.alarmOn) return;
    audio.alarmOn = on;
    if (!on) {
      if (audio.alarmNodes) {
        try { audio.alarmNodes.osc.stop(); } catch (err) { /* sudah berhenti */ }
        audio.alarmNodes = null;
      }
      return;
    }
    const ctx = ensure();
    if (!ctx || audio.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 620;
    lfo.type = 'sine';
    lfo.frequency.value = 2.4;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(osc.frequency);
    gain.gain.value = 0.045;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    lfo.start();
    audio.alarmNodes = { osc, lfo };
  };

  audio.toggleMute = () => {
    audio.muted = !audio.muted;
    if (audio.muted) audio.setAlarm(false);
    return audio.muted;
  };
  return audio;
}
