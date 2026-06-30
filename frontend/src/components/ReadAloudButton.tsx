import { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useReadAloud } from '../hooks/useReadAloud';

interface ReadAloudButtonProps {
  text: string;
  /** Beim Erscheinen automatisch vorlesen (Standard fuer Frage-Screens). */
  autoPlay?: boolean;
  /** Heller Halo um den Button (zentrierte Variante ueber dem Titel). */
  halo?: boolean;
}

/** Oranger runder Vorlese-Button (docs/ui_konzept). Liest den Text per SpeechSynthesis vor. */
export function ReadAloudButton({ text, autoPlay = false, halo = false }: ReadAloudButtonProps) {
  const { speak, cancel } = useReadAloud();

  useEffect(() => {
    if (autoPlay) speak(text);
    return () => cancel();
  }, [text, autoPlay, speak, cancel]);

  return (
    <button
      onClick={() => speak(text)}
      aria-label="Frage vorlesen"
      className={`flex h-14 w-14 items-center justify-center rounded-full bg-brand-amber text-white shadow-sm active:brightness-95 ${
        halo ? 'ring-8 ring-brand-amber-ring' : ''
      }`}
    >
      <Volume2 size={26} strokeWidth={2.5} />
    </button>
  );
}
