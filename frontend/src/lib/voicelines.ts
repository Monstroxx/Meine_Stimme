// Vorab aufgenommene Ansagen pro Screen (liegen in frontend/public/voicelines/,
// werden von Vite unter /voicelines/... ausgeliefert). Ersetzen die TTS-Stimme,
// die auf dem Kiosk-Tablet nicht zuverlaessig verfuegbar ist.
export const VOICELINES = {
  start: '/voicelines/01_Hallo.wav',
  problem: '/voicelines/02_Erklahrung_Aufnahmeknopf.wav',
  solution: '/voicelines/03_Idee.wav',
  name: '/voicelines/04_Namen-veraten.wav',
  confirm: '/voicelines/05_Eingaben-anhoren.wav',
  done: '/voicelines/06_Fertig.wav',
} as const;
