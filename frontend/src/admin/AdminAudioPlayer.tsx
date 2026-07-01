import { useEffect, useRef, useState } from 'react';
import { Lock, Pause, Play } from 'lucide-react';
import { registerPlayback } from '../lib/audioPlayback';
import { getAudioUrl, type AudioField } from './adminApi';

const BUCKETS = 56;

// Gemeinsamer AudioContext nur zum Dekodieren der Wellenform (nicht fuer die Wiedergabe).
let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!sharedCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedCtx = new Ctor();
  }
  return sharedCtx;
}

/** Dekodiert die Audiodaten und bildet pro Balken die Lautstaerke (RMS, normalisiert 0..1). */
async function decodePeaks(buffer: ArrayBuffer): Promise<number[]> {
  const audioBuf = await getCtx().decodeAudioData(buffer);
  const data = audioBuf.getChannelData(0);
  const size = Math.max(1, Math.floor(data.length / BUCKETS));
  const peaks: number[] = [];
  let max = 0;
  for (let i = 0; i < BUCKETS; i++) {
    let sum = 0;
    for (let j = 0; j < size; j++) {
      const v = data[i * size + j] || 0;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / size);
    peaks.push(rms);
    if (rms > max) max = rms;
  }
  return peaks.map((p) => (max > 0 ? p / max : 0));
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Audio-Player fuer die Verwaltung: laedt bei Klick eine signierte URL, zeigt eine echte
 * Wellenform mit Fortschritt und erlaubt Klick-zum-Spulen. Ueber registerPlayback() laeuft
 * immer nur der zuletzt gestartete Player – andere werden automatisch gestoppt.
 */
export function AdminAudioPlayer({
  complaintId,
  field,
  label,
  disabled,
}: {
  complaintId: string;
  field: AudioField;
  label: string;
  disabled: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const ensureLoaded = async (): Promise<HTMLAudioElement> => {
    if (audioRef.current) return audioRef.current;

    const url = await getAudioUrl(complaintId, field);
    const resp = await fetch(url);
    const arrayBuffer = await resp.arrayBuffer();

    // Blob-URL statt Remote-URL: gleiche Herkunft, keine CORS-Probleme bei der Wiedergabe.
    const blob = new Blob([arrayBuffer], { type: 'audio/webm' });
    const objectUrl = URL.createObjectURL(blob);
    objectUrlRef.current = objectUrl;

    const audio = new Audio(objectUrl);
    audio.onplay = () => setPlaying(true);
    audio.onpause = () => setPlaying(false);
    audio.onended = () => {
      setPlaying(false);
      setProgress(0);
    };
    audio.onloadedmetadata = () => setDuration(audio.duration || 0);
    audio.ontimeupdate = () =>
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    audioRef.current = audio;

    // Wellenform im Hintergrund dekodieren (blockiert die Wiedergabe nicht).
    decodePeaks(arrayBuffer.slice(0))
      .then(setPeaks)
      .catch(() => setPeaks(null));

    return audio;
  };

  const toggle = async () => {
    setError(null);
    if (playing && audioRef.current) {
      audioRef.current.pause();
      return;
    }
    setLoading(true);
    try {
      const audio = await ensureLoaded();
      registerPlayback(audio); // stoppt jeden anderen laufenden Player
      await audio.play();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Audio konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  if (disabled) {
    return (
      <span className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-400">
        <Lock size={16} strokeWidth={2.5} /> {label} · Nur für Leitung
      </span>
    );
  }

  const bars = peaks ?? Array.from({ length: BUCKETS }, () => 0.15);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-2xl bg-[#fff7ea] px-3 py-2.5">
        <button
          onClick={toggle}
          disabled={loading}
          aria-label={playing ? `${label} pausieren` : `${label} abspielen`}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#f39a0e] text-white shadow-sm active:brightness-95 disabled:opacity-60"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : playing ? (
            <Pause size={20} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play size={20} fill="currentColor" strokeWidth={0} className="ml-0.5" />
          )}
        </button>

        <div
          onClick={seek}
          className="flex h-11 flex-1 cursor-pointer items-center gap-[2px]"
        >
          {bars.map((p, i) => {
            const played = i / bars.length <= progress;
            return (
              <span
                key={i}
                className={`flex-1 rounded-full transition-colors ${played ? 'bg-[#f39a0e]' : 'bg-[#f3d9a8]'}`}
                style={{ height: `${Math.max(10, p * 100)}%` }}
              />
            );
          })}
        </div>

        <span className="w-16 flex-none text-right text-xs font-semibold tabular-nums text-[#9a5a00]">
          {formatTime(progress * duration)} / {formatTime(duration)}
        </span>
      </div>
      <span className="pl-1 text-xs font-bold uppercase tracking-wide text-gray-400">{label}</span>
      {error && <span className="pl-1 text-xs font-semibold text-red-600">{error}</span>}
    </div>
  );
}
