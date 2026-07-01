// Whisper-Spracherkennung im Browser (Transformers.js), als Modul statt Hook,
// damit die Erkennung im Hintergrund weiterläuft, auch wenn der Screen wechselt.
// Singleton: Modell/WASM-Pipeline nur einmal laden; dynamischer Import haelt das
// grosse Paket aus dem Haupt-Bundle (Kiosk-Startzeit).

type TranscribeFn = (
  input: string,
  opts: Record<string, unknown>,
) => Promise<{ text: string } | { text: string }[]>;

let transcriberPromise: Promise<TranscribeFn> | null = null;

// Letzte Messwerte auch am window ablegen, damit man sie auf dem Tablet ohne Konsole
// abfragen kann (z. B. per Lesezeichen-Skript): window.__whisperTiming
export interface WhisperTiming {
  modelLoadMs?: number;
  lastTranscribeMs?: number;
  lastAudioKB?: number;
}
export const whisperTiming: WhisperTiming = {};
if (typeof window !== 'undefined') {
  (window as unknown as { __whisperTiming: WhisperTiming }).__whisperTiming = whisperTiming;
}

function getTranscriber(): Promise<TranscribeFn> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const t0 = performance.now();
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      const pipe = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
      whisperTiming.modelLoadMs = Math.round(performance.now() - t0);
      // Enthaelt beim ersten Mal auch den Modell-Download (~150 MB) – danach kommt das Modell aus dem Cache.
      console.info(`[whisper] Modell geladen in ${whisperTiming.modelLoadMs} ms`);
      return pipe as unknown as TranscribeFn;
    })();
  }
  return transcriberPromise;
}

/** Transkribiert einen Audio-Blob zu deutschem Text. Wirft bei Fehler. */
export async function transcribeBlob(blob: Blob): Promise<string> {
  const url = URL.createObjectURL(blob);
  try {
    const transcriber = await getTranscriber();
    const t0 = performance.now();
    const output = await transcriber(url, {
      language: 'german',
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    whisperTiming.lastTranscribeMs = Math.round(performance.now() - t0);
    whisperTiming.lastAudioKB = Math.round(blob.size / 1024);
    console.info(
      `[whisper] Transkription in ${whisperTiming.lastTranscribeMs} ms (${whisperTiming.lastAudioKB} KB Audio)`,
    );
    const text = Array.isArray(output) ? output.map((o) => o.text).join(' ') : output.text;
    return text.trim();
  } finally {
    URL.revokeObjectURL(url);
  }
}
