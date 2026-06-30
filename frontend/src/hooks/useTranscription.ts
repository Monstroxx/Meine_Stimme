import { useCallback, useState } from 'react';

export type TranscriptionStatus = 'idle' | 'loading' | 'transcribing' | 'done' | 'error';

// Singleton: Modell + WASM-Pipeline nur einmal laden und ueber alle Aufnahmen wiederverwenden.
// Dynamischer Import haelt @xenova/transformers aus dem Haupt-Bundle (Kiosk-Startzeit).
let transcriberPromise: Promise<unknown> | null = null;

function getTranscriber(): Promise<unknown> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers');
      // Im Browser kein lokales Modell-Verzeichnis – immer vom HF-Hub laden und cachen.
      env.allowLocalModels = false;
      // whisper-base statt -tiny: spuerbar bessere deutsche Erkennung, laeuft im Browser
      // noch fluessig und wird nach dem ersten Download im IndexedDB gecacht.
      return pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
    })();
  }
  return transcriberPromise;
}

export function useTranscription() {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');

  const transcribe = useCallback(async (blob: Blob): Promise<string | null> => {
    const url = URL.createObjectURL(blob);
    try {
      setStatus('loading');
      const transcriber = (await getTranscriber()) as (
        input: string,
        opts: Record<string, unknown>,
      ) => Promise<{ text: string } | { text: string }[]>;

      setStatus('transcribing');
      const output = await transcriber(url, {
        language: 'german',
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
      });

      const text = Array.isArray(output)
        ? output.map((o) => o.text).join(' ')
        : output.text;

      setStatus('done');
      return text.trim();
    } catch (err) {
      console.error('Transkription fehlgeschlagen', err);
      setStatus('error');
      return null;
    } finally {
      URL.revokeObjectURL(url);
    }
  }, []);

  return { status, transcribe };
}
