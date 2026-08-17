/**
 * COSMOS.AI Web Audio Procedural Soundscape Engine
 * Pure procedural audio synthesis - 0 external file dependencies
 */

let audioCtx = null;
let masterGain = null;
let isAudioEnabled = false;
let ambientNodes = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleAudio() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  isAudioEnabled = !isAudioEnabled;

  if (isAudioEnabled) {
    startAmbientDrone();
    playBeep('activate');
  } else {
    stopAmbientDrone();
  }

  return isAudioEnabled;
}

export function getAudioState() {
  return isAudioEnabled;
}

export function startAmbientDrone() {
  const ctx = getAudioContext();
  if (!ctx || ambientNodes) return;

  const droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(0, ctx.currentTime);
  droneGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3);

  // Sub bass fundamental
  const oscSub = ctx.createOscillator();
  oscSub.type = 'sine';
  oscSub.frequency.setValueAtTime(55, ctx.currentTime); // A1

  // Harmonic fifth
  const oscFifth = ctx.createOscillator();
  oscFifth.type = 'sine';
  oscFifth.frequency.setValueAtTime(82.5, ctx.currentTime); // E2

  // Shimmering octave pad
  const oscPad = ctx.createOscillator();
  oscPad.type = 'triangle';
  oscPad.frequency.setValueAtTime(220, ctx.currentTime); // A3

  // Lowpass filter for smooth warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(350, ctx.currentTime);
  filter.Q.setValueAtTime(3, ctx.currentTime);

  // LFO filter sweep
  const lfo = ctx.createOscillator();
  lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(120, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  oscSub.connect(filter);
  oscFifth.connect(filter);
  oscPad.connect(filter);
  filter.connect(droneGain);
  droneGain.connect(masterGain);

  oscSub.start();
  oscFifth.start();
  oscPad.start();
  lfo.start();

  ambientNodes = {
    oscillators: [oscSub, oscFifth, oscPad, lfo],
    droneGain,
  };
}

export function stopAmbientDrone() {
  if (!ambientNodes || !audioCtx) return;

  const { droneGain, oscillators } = ambientNodes;
  droneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);

  setTimeout(() => {
    oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_) {}
    });
    droneGain.disconnect();
    ambientNodes = null;
  }, 1300);
}

export function playBeep(type = 'click') {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  if (type === 'hover') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.09);
  } else if (type === 'activate') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.26);
  } else if (type === 'radarChirp') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.05);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.start(now);
    osc.stop(now + 0.07);
  } else if (type === 'warp') {
    // Warp drive sound sweep
    const warpFilter = ctx.createBiquadFilter();
    warpFilter.type = 'bandpass';
    warpFilter.frequency.setValueAtTime(200, now);
    warpFilter.frequency.exponentialRampToValueAtTime(3500, now + 0.8);
    warpFilter.Q.setValueAtTime(4, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.8);

    osc.disconnect();
    osc.connect(warpFilter);
    warpFilter.connect(gain);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.start(now);
    osc.stop(now + 0.95);
  }
}

export function playSound(type) {
  playBeep(type);
}
