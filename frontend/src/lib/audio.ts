"use client";

let music: HTMLAudioElement | null = null;
let lastHoveredButton: EventTarget | null = null;
let musicVolume = 0.2;
let soundEffectsVolume = 1;
let masterVolume = 1;
const audioCache = new Map<string, HTMLAudioElement>();
const SOUND_FILES = [
  "punch.wav",
  "feed.wav",
  "reader.wav",
  "printer.wav",
  "lock.wav",
  "paper-enter.wav",
  "paper-scrap.wav",
  "paper-deck.wav",
  "hover.wav",
  "button.wav",
  "error.wav",
  "complete.mp3",
  "music.mp3",
];

function playFile(file: string, volume: number, playbackRate = 1) {
  if (typeof window === "undefined") return;
  const source = audioCache.get(file) ?? new Audio(`/sounds/${file}`);
  audioCache.set(file, source);
  const audio = source.cloneNode(true) as HTMLAudioElement;
  audio.volume = Math.min(1, Math.max(0, volume * soundEffectsVolume * masterVolume));
  audio.playbackRate = playbackRate;
  audio.play().catch(() => {});
}

export function preloadAudio() {
  if (typeof window === "undefined") return;
  for (const file of SOUND_FILES) {
    if (audioCache.has(file)) continue;
    const audio = new Audio(`/sounds/${file}`);
    audio.preload = "auto";
    audio.load();
    audioCache.set(file, audio);
  }
  if (!music) {
    music = audioCache.get("music.mp3") ?? new Audio("/sounds/music.mp3");
    music.preload = "auto";
    music.loop = true;
    music.volume = musicVolume * masterVolume;
    music.muted = musicVolume === 0 || masterVolume === 0;
    audioCache.set("music.mp3", music);
    music.load();
  }
}

export function initAudio() {
  if (typeof window === "undefined") return;
  preloadAudio();
  if (!music) {
    music = audioCache.get("music.mp3") ?? new Audio("/sounds/music.mp3");
  }
  if (musicVolume === 0 || masterVolume === 0) {
    music.muted = true;
    music.pause();
    return;
  }
  music.muted = false;
  music.play().catch(() => {});
}

export function setMusicVolume(volume: number) {
  musicVolume = Math.min(1, Math.max(0, volume));
  if (!music) return;
  music.volume = musicVolume * masterVolume;
  if (musicVolume === 0 || masterVolume === 0) {
    music.muted = true;
    music.pause();
  } else {
    music.muted = false;
    music.play().catch(() => {});
  }
}

export function setSoundEffectsVolume(volume: number) {
  soundEffectsVolume = Math.min(1, Math.max(0, volume));
}

export function setMasterVolume(volume: number) {
  masterVolume = Math.min(1, Math.max(0, volume));
  if (!music) return;
  music.volume = musicVolume * masterVolume;
  if (masterVolume === 0 || musicVolume === 0) {
    music.muted = true;
    music.pause();
  } else {
    music.muted = false;
    music.play().catch(() => {});
  }
}

export function playPunchSound() {
  playFile("punch.wav", 0.8);
}

export function playFeedSound() {
  playFile("feed.wav", 0.6);
}

export function playReaderSound() {
  playFile("reader.wav", 0.7);
}

export function playPrinterSound() {
  playFile("printer.wav", 0.5);
}

export function playLockSound() {
  playFile("lock.wav", 0.6);
}

export function playPaperEnterSound() {
  playFile("paper-enter.wav", 0.65);
}

export function playPaperScrapSound() {
  playFile("paper-scrap.wav", 0.65);
}

export function playPaperDeckSound() {
  playFile("paper-deck.wav", 0.65);
}

export function playHoverSound(target: EventTarget | null) {
  if (target === lastHoveredButton) return;
  lastHoveredButton = target;
  const playbackRate = 0.94 + Math.random() * 0.12;
  playFile("hover.wav", 1, playbackRate);
}

export function playButtonSound() {
  const playbackRate = 0.96 + Math.random() * 0.08;
  playFile("button.wav", 0.2, playbackRate);
}

export function playCompileSound() {
  playFile("complete.mp3", 0.7);
}

export function playErrorSound() {
  playFile("error.wav", 0.75);
}
