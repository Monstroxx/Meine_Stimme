// Kleiner globaler Playback-Controller: es soll immer nur eine Ansage laufen, und
// beim Start einer Aufnahme muss die laufende Ansage sofort stoppen (sauberer Record).

let current: HTMLAudioElement | null = null;

/** Meldet ein gerade startendes Audio als aktuelles an und stoppt ein evtl. anderes. */
export function registerPlayback(el: HTMLAudioElement) {
  if (current && current !== el) {
    current.pause();
    current.currentTime = 0;
  }
  current = el;
}

/** Stoppt jede laufende Ansage (Audio-Element + Sprachausgabe). */
export function stopCurrentPlayback() {
  if (current) {
    current.pause();
    current.currentTime = 0;
    current = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
