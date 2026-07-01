// Wandelt einen aufgenommenen Audio-Blob (MediaRecorder liefert WebM/Opus) in eine
// universell abspielbare WAV-Datei (16-bit PCM, mono) um. Viele Mail-Programme koennen
// .webm nicht abspielen – .wav laeuft praktisch ueberall. Nutzt nur die Web Audio API,
// keine externe Bibliothek.

let ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}

/** Schreibt einen AudioBuffer (auf Mono heruntergemischt) als WAV-Blob. */
function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  // Auf Mono heruntermischen (kleinere Datei, fuer Sprache voellig ausreichend).
  const mono = new Float32Array(length);
  for (let ch = 0; ch < numChannels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) mono[i] += data[i] / numChannels;
  }

  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt-Chunk-Groesse
  view.setUint16(20, 1, true); // Audioformat = PCM
  view.setUint16(22, 1, true); // Kanaele = mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte-Rate (SampleRate * BlockAlign)
  view.setUint16(32, 2, true); // Block-Align (Kanaele * BytesProSample)
  view.setUint16(34, 16, true); // Bits pro Sample
  writeString(view, 36, 'data');
  view.setUint32(40, length * 2, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Konvertiert einen Aufnahme-Blob in WAV. Schlaegt das Dekodieren fehl (z. B. unbekanntes
 * Format), wird der Original-Blob zurueckgegeben, damit der Versand nicht scheitert.
 */
export async function blobToWav(blob: Blob): Promise<Blob> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await getCtx().decodeAudioData(arrayBuffer);
    return encodeWav(audioBuffer);
  } catch {
    return blob;
  }
}
