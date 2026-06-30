import { useEffect, useState } from 'react';
import { Keyboard, Mic, Play, RotateCcw } from 'lucide-react';
import { MicButton } from './MicButton';
import { useRecorder } from '../hooks/useRecorder';
import { useTranscription } from '../hooks/useTranscription';

interface RecordControlsProps {
  onBlob: (blob: Blob | null) => void;
  onTranscript?: (text: string) => void;
  size?: 'lg' | 'md';
  placeholder?: string;
}

/**
 * Eingabe nach docs/ui_konzept: roter Mic-Knopf mit Anhören/Neu und erkanntem Text.
 * Der erkannte Text ist editierbar (Whisper ist nicht perfekt), und per Tastatur-Symbol
 * kann komplett getippt statt gesprochen werden – wichtig z. B. fuer Namen.
 */
export function RecordControls({
  onBlob,
  onTranscript,
  size = 'md',
  placeholder = 'Hier tippen …',
}: RecordControlsProps) {
  const { state, audioBlob, audioUrl, error, startRecording, stopRecording, reset } = useRecorder();
  const { status: transStatus, transcribe } = useTranscription();
  const [mode, setMode] = useState<'voice' | 'type'>('voice');
  const [text, setText] = useState('');

  // Aufnahme fertig: Blob hochreichen und transkribieren.
  useEffect(() => {
    if (!audioBlob) return;
    onBlob(audioBlob);

    let cancelled = false;
    transcribe(audioBlob).then((t) => {
      if (cancelled || !t) return;
      setText(t);
      onTranscript?.(t);
    });
    return () => {
      cancelled = true;
    };
  }, [audioBlob, onBlob, onTranscript, transcribe]);

  const updateText = (value: string) => {
    setText(value);
    onTranscript?.(value);
  };

  const handleMicClick = () => {
    if (state === 'idle') startRecording();
    else if (state === 'recording') stopRecording();
  };

  const startOver = () => {
    updateText('');
    onBlob(null);
    reset();
  };

  const switchToType = () => {
    // Aufnahme verwerfen, damit kein abgebrochenes Audio mitgeschickt wird.
    onBlob(null);
    reset();
    setMode('type');
  };

  const playback = () => {
    if (audioUrl) new Audio(audioUrl).play();
  };

  const transcribing = transStatus === 'loading' || transStatus === 'transcribing';

  // ── Tastatur-Modus ────────────────────────────────────────────────
  if (mode === 'type') {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => updateText(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-2xl border-2 border-brand-blue/40 bg-white px-5 py-4 text-xl font-semibold leading-snug text-gray-800 outline-none focus:border-brand-blue"
        />
        <button
          onClick={() => setMode('voice')}
          className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 text-lg font-bold text-gray-600 active:bg-gray-50"
        >
          <Mic size={22} strokeWidth={2.5} /> Lieber sprechen
        </button>
      </div>
    );
  }

  // ── Sprach-Modus ──────────────────────────────────────────────────
  return (
    <div className="flex w-full flex-col items-center gap-6">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">{error}</p>
      )}

      <MicButton state={state} onClick={handleMicClick} size={size} />

      {state === 'recording' && <p className="text-lg font-bold text-brand-mic">Ich höre zu …</p>}

      {state === 'idle' && (
        <button
          onClick={switchToType}
          className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 text-lg font-bold text-gray-600 active:bg-gray-50"
        >
          <Keyboard size={22} strokeWidth={2.5} /> Tastatur
        </button>
      )}

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
              onClick={startOver}
              className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 text-lg font-bold text-gray-600 active:bg-gray-50"
            >
              <RotateCcw size={22} strokeWidth={2.5} /> Neu
            </button>
          </div>

          {transcribing ? (
            <p className="text-base font-semibold text-gray-400">Text wird erkannt …</p>
          ) : (
            <div className="w-full">
              <p className="mb-2 text-left text-sm font-bold text-gray-400">
                {transStatus === 'error'
                  ? 'Konnte nicht erkannt werden – bitte tippen:'
                  : 'Erkannt – du kannst es verbessern:'}
              </p>
              <textarea
                value={text}
                onChange={(e) => updateText(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-5 py-4 text-lg font-semibold leading-snug text-gray-800 outline-none focus:border-brand-blue focus:bg-white"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
