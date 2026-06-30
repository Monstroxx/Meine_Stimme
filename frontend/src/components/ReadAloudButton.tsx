import { useCallback, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { useReadAloud } from '../hooks/useReadAloud';
import { registerPlayback } from '../lib/audioPlayback';

interface ReadAloudButtonProps {
  text: string;
  /** Vorab aufgenommene Ansage (bevorzugt). Ohne audioSrc wird der Text per TTS vorgelesen. */
  audioSrc?: string;
  /** Beim Erscheinen automatisch abspielen (Standard fuer Frage-Screens). */
  autoPlay?: boolean;
  /** Heller Halo um den Button (zentrierte Variante ueber dem Titel). */
  halo?: boolean;
}

/**
 * Oranger runder Vorlese-Button (docs/ui_konzept). Spielt die aufgenommene Ansage
 * (audioSrc) ab – beim Erscheinen automatisch und erneut bei jedem Tippen.
 * Fallback ohne audioSrc: Vorlesen per SpeechSynthesis.
 */
export function ReadAloudButton({ text, audioSrc, autoPlay = false, halo = false }: ReadAloudButtonProps) {
  const { speak, cancel } = useReadAloud();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio-Element fuer diese Ansage einmal anlegen.
  useEffect(() => {
    if (!audioSrc) return;
    const el = new Audio(audioSrc);
    el.preload = 'auto';
    audioRef.current = el;
    return () => {
      el.pause();
      audioRef.current = null;
    };
  }, [audioSrc]);

  const play = useCallback(() => {
    if (audioSrc) {
      const el = audioRef.current;
      if (!el) return;
      registerPlayback(el); // als aktuelle Ansage merken, damit der Record sie stoppen kann
      el.currentTime = 0; // bei erneutem Tippen von vorne abspielen
      // Autoplay kann bis zur ersten Nutzer-Interaktion vom Browser blockiert werden.
      void el.play().catch(() => {});
    } else {
      speak(text);
    }
  }, [audioSrc, text, speak]);

  useEffect(() => {
    if (autoPlay) play();
    return () => cancel();
  }, [autoPlay, play, cancel]);

  return (
    <button
      onClick={play}
      aria-label="Vorlesen"
      className={`flex h-14 w-14 items-center justify-center rounded-full bg-brand-amber text-white shadow-sm active:brightness-95 ${
        halo ? 'ring-8 ring-brand-amber-ring' : ''
      }`}
    >
      <Volume2 size={26} strokeWidth={2.5} />
    </button>
  );
}
