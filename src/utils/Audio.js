// =============================================================
// Audio.js — background music + tiny Web Audio SFX
// Uses Howler for the existing MP3 in public/audio and falls back
// to oscillator beeps for UI interaction sounds.
// =============================================================

import { Howl } from "howler";

const musicFile = "/audio/Johny%20Grimes%20-%20Angel%20Of%20The%20Flame%20%28freetouse.com%29.mp3";

let ctx = null;
let enabled = false;
let unlocked = false;
let music = null;

function getCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function ensureMusic() {
  if (music) return music;

  music = new Howl({
    src: [musicFile],
    loop: true,
    volume: 0.35,
    preload: true,
    onplayerror: () => {
      if (music) {
        music.once("unlock", () => music.play());
      }
    },
    onloaderror: (_id, error) => {
      console.error("Unable to load background music:", error);
    },
  });

  return music;
}

function syncMusicState() {
  if (!music) return;

  if (!enabled || !unlocked) {
    music.stop();
    return;
  }

  if (!music.playing()) {
    music.play();
  }
}

async function resumeContext() {
  const c = getCtx();
  if (c?.state === "suspended") {
    try {
      await c.resume();
    } catch {
      // The next user gesture will retry the browser audio unlock.
    }
  }
}

function blip(freq = 600, dur = 0.08, type = "sine", gain = 0.05) {
  const c = getCtx();
  if (!c || !enabled) return;
  if (c.state === "suspended") c.resume();

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, c.currentTime + dur);
  env.gain.setValueAtTime(0, c.currentTime);
  env.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(env).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur + 0.05);
}

export const audio = {
  unlock() {
    enabled = true;
    unlocked = true;
    const track = ensureMusic();
    if (!track.playing()) track.play();
    resumeContext();
    syncMusicState();
  },
  setEnabled(v) {
    enabled = v;
    if (v) {
      const track = ensureMusic();
      if (unlocked) {
        if (!track.playing()) track.play();
      }
      resumeContext();
    } else if (music) {
      music.pause();
    }
    syncMusicState();
  },
  get enabled() {
    return enabled;
  },
  resume() {
    if (!enabled || !unlocked) return;
    const track = ensureMusic();
    if (!track.playing()) track.play();
    resumeContext();
  },
  hover() {
    blip(900, 0.05, "sine", 0.025);
  },
  click() {
    blip(520, 0.12, "triangle", 0.07);
  },
  open() {
    blip(700, 0.1, "sine", 0.04);
    setTimeout(() => blip(950, 0.12, "sine", 0.04), 60);
  },
  close() {
    blip(420, 0.1, "sine", 0.04);
  },
  theme() {
    blip(660, 0.15, "square", 0.04);
  },
  enter() {
    blip(440, 0.2, "sine", 0.05);
    setTimeout(() => blip(660, 0.2, "sine", 0.05), 120);
    setTimeout(() => blip(880, 0.3, "sine", 0.05), 240);
  },
};
