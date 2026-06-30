import { useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { MicButton } from './MicButton';
import { useRecorder } from '../hooks/useRecorder';
import { useTranscription } from '../hooks/useTranscription';

interface RecordControlsProps {
  onBlob: (blob: Blob) => void;
  onTranscript?: (text: string) => void;
  size?: 'lg' | 'md';
}

/** Mikrofon-Aufnahme nach docs/ui_konzept: roter Knopf, Anhören/Neu, erkannter Text. */
export function RecordControls({ onBlob, onTranscript, size = 'md' }: RecordControlsProps) {
  const { state, audioBlob, audioUrl, error, startRecording, stopRecording, reset } = useRecorder();
  const { status: transStatus, transcribe } = useTranscription();
  const [transcript, setTranscript] = useState<string | null>(null);

  // Sobald die Aufnahme fertig ist: Blob hochreichen und transkribieren.
  useEffect(() => {
    if (!audioBlob) return;
    onBlob(audioBlob);

    let cancelled = false;
    transcribe(audioBlob).then((text) => {
      if (cancelled || !text) return;
      setTranscript(text);
      onTranscript?.(text);
    });
    return () => {
      cancelled = true;
    };
  }, [audioBlob, onBlob, onTranscript, transcribe]);

  const handleMicClick = () => {
    if (state === 'idle') startRecording();
    else if (state === 'recording') stopRecording();
    else {
      setTranscript(null);
      reset();
    }
  };

  const playback = () => {
    if (audioUrl) new Audio(audioUrl).play();
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">{error}</p>
      )}

      <MicButton state={state} onClick={handleMicClick} size={size} />

      {state === 'recording' && <p className="text-lg font-bold text-brand-mic">Ich höre zu …</p>}

      {state === 'done' && (
        <>
          <div className="flex gap-3">
            <button
              onClick={playback}
              className="flex items-center gap-2 rounded-2xl bg-[#fbe7c6] px-5 py-3 text-lg font-bold text-[#9a5a00] active:brightness-95"
            >
              <Play size={22} fill="currentColor" strokeWidth={0} /> Anhören
            </button>
            <button
              onClick={() => {
                setTranscript(null);
                reset();
              }}
              className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 text-lg font-bold text-gray-600 active:bg-gray-50"
            >
              <RotateCcw size={22} strokeWidth={2.5} /> Neu
            </button>
          </div>

          {(transStatus === 'loading' || transStatus === 'transcribing') && (
            <p className="text-base font-semibold text-gray-400">Text wird erkannt …</p>
          )}
          {transcript && (
            <div className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-left">
              <p className="text-lg font-semibold leading-snug text-gray-800">„{transcript}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
