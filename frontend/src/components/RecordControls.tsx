import { useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { MicButton } from './MicButton';
import { useRecorder } from '../hooks/useRecorder';

interface RecordControlsProps {
  onBlob: (blob: Blob) => void;
  size?: 'lg' | 'md';
  /** Wird in Tag 3 mit useTranscription befuellt */
  onTranscript?: (text: string) => void;
}

/** Mikrofon-Aufnahme nach docs/ui_konzept: grosser roter Knopf + Anhören/Neu-aufnehmen. */
export function RecordControls({ onBlob, size = 'md' }: RecordControlsProps) {
  const { state, audioBlob, audioUrl, error, startRecording, stopRecording, reset } = useRecorder();

  // Blob an Parent weiterreichen sobald Aufnahme fertig ist.
  useEffect(() => {
    if (audioBlob) onBlob(audioBlob);
  }, [audioBlob, onBlob]);

  const handleMicClick = () => {
    if (state === 'idle') startRecording();
    else if (state === 'recording') stopRecording();
    else reset();
  };

  const playback = () => {
    if (audioUrl) new Audio(audioUrl).play();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">{error}</p>
      )}

      <MicButton state={state} onClick={handleMicClick} size={size} />

      {state === 'recording' && (
        <p className="text-lg font-bold text-brand-mic">Ich höre zu …</p>
      )}

      {state === 'done' && (
        <div className="flex gap-3">
          <button
            onClick={playback}
            className="flex items-center gap-2 rounded-2xl bg-[#fbe7c6] px-5 py-3 text-lg font-bold text-[#9a5a00] active:brightness-95"
          >
            <Play size={22} fill="currentColor" strokeWidth={0} /> Anhören
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 text-lg font-bold text-gray-600 active:bg-gray-50"
          >
            <RotateCcw size={22} strokeWidth={2.5} /> Neu
          </button>
        </div>
      )}
    </div>
  );
}
