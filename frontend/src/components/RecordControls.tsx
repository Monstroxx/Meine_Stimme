import { useEffect } from 'react';
import { BigButton } from './BigButton';
import { useReadAloud } from '../hooks/useReadAloud';
import { useRecorder } from '../hooks/useRecorder';

interface RecordControlsProps {
  question: string;
  onBlob: (blob: Blob) => void;
  /** Wird in Tag 3 mit useTranscription befuellt */
  onTranscript?: (text: string) => void;
}

export function RecordControls({ question, onBlob }: RecordControlsProps) {
  const { speak, cancel } = useReadAloud();
  const { state, audioBlob, audioUrl, error, startRecording, stopRecording, reset } = useRecorder();

  useEffect(() => {
    speak(question);
    return () => cancel();
  }, [question, speak, cancel]);

  // Blob an Parent weiterreichen sobald Aufnahme fertig ist.
  useEffect(() => {
    if (audioBlob) onBlob(audioBlob);
  }, [audioBlob, onBlob]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {state === 'idle' && (
        <BigButton onClick={startRecording} className="w-full bg-red-500 text-white hover:bg-red-600">
          🎤 Aufnehmen
        </BigButton>
      )}

      {state === 'recording' && (
        <BigButton onClick={stopRecording} className="w-full animate-pulse bg-red-600 text-white">
          ⏹ Stopp
        </BigButton>
      )}

      {state === 'done' && audioUrl && (
        <div className="flex w-full flex-col gap-3">
          <audio src={audioUrl} controls className="w-full rounded-xl" />
          <div className="flex gap-3">
            <BigButton variant="ghost" onClick={reset} className="flex-1">
              🔄 Neu aufnehmen
            </BigButton>
            <BigButton
              variant="ghost"
              onClick={() => speak(question)}
              className="flex-1"
            >
              🔊 Frage wiederholen
            </BigButton>
          </div>
        </div>
      )}

      {state !== 'recording' && (
        <button
          onClick={() => speak(question)}
          className="text-sm text-gray-500 underline underline-offset-2"
        >
          🔊 Frage nochmal vorlesen
        </button>
      )}
    </div>
  );
}
