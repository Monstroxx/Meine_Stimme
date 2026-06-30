import { useCallback, useEffect, useRef } from 'react';

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith('de') && v.localService) ??
    voices.find((v) => v.lang.startsWith('de')) ??
    voices[0] ??
    null
  );
}

export function useReadAloud() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const load = () => {
      voiceRef.current = pickVoice();
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'de-DE';
    utt.rate = 0.9;
    if (voiceRef.current) utt.voice = voiceRef.current;
    window.speechSynthesis.speak(utt);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, cancel };
}
