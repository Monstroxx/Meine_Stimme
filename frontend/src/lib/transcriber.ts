// Whisper-Spracherkennung im Browser (Transformers.js), als Modul statt Hook,
// damit die Erkennung im Hintergrund weiterläuft, auch wenn der Screen wechselt.
// Singleton: Modell/WASM-Pipeline nur einmal laden; dynamischer Import haelt das
// grosse Paket aus dem Haupt-Bundle (Kiosk-Startzeit).

type TranscribeFn = (
  input: string,
  opts: Record<string, unknown>,
) => Promise<{ text: string } | { text: string }[]>;

let transcriberPromise: Promise<TranscribeFn> | null = null;

function getTranscriber(): Promise<TranscribeFn> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      const pipe = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
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
    const output = await transcriber(url, {
      language: 'german',
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    const text = Array.isArray(output) ? output.map((o) => o.text).join(' ') : output.text;
    return text.trim();
  } finally {
    URL.revokeObjectURL(url);
  }
}
