export function initAudio() {
  // Satisfies browser audio unlock policy
}

export function playPunchSound() {
  if (typeof window === "undefined") return;
  const audio = new Audio("/sounds/punch.wav");
  audio.volume = 0.8;
  audio.play().catch(() => {});
}

export function playFeedSound() {
  if (typeof window === "undefined") return;
  const audio = new Audio("/sounds/feed.wav");
  audio.volume = 0.6;
  audio.play().catch(() => {});
}

export function playReaderSound() {
  if (typeof window === "undefined") return;
  const audio = new Audio("/sounds/reader.wav");
  audio.volume = 0.7;
  audio.play().catch(() => {});
}

export function playPrinterSound() {
  if (typeof window === "undefined") return;
  const audio = new Audio("/sounds/printer.wav");
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

export function playLockSound() {
  if (typeof window === "undefined") return;
  const audio = new Audio("/sounds/lock.wav");
  audio.volume = 0.6;
  audio.play().catch(() => {});
}