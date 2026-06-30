import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Play } from 'lucide-react';
import { BigButton } from '../components/BigButton';
import { KioskFrame } from '../components/KioskFrame';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { VOICELINES } from '../lib/voicelines';
import { useFacilitySlug } from '../lib/facility';
import { useComplaintStore } from '../state/complaintStore';
import { submitComplaint } from '../lib/submitComplaint';

/** Spielt mehrere Audio-Blobs nacheinander ab (Problem → Idee → Name). */
async function playSequentially(blobs: Blob[]) {
  for (const blob of blobs) {
    const url = URL.createObjectURL(blob);
    await new Promise<void>((resolve) => {
      const audio = new Audio(url);
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
    URL.revokeObjectURL(url);
  }
}

export function ConfirmScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const { problemBlob, solutionBlob, nameBlob, problemText, solutionText, nameText, isAnonymous } =
    useComplaintStore();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playAll = () => {
    const blobs = [problemBlob, solutionBlob, nameBlob].filter((b): b is Blob => b !== null);
    if (blobs.length > 0) void playSequentially(blobs);
  };

  const handleSend = async () => {
    if (!facilitySlug) return;
    setSending(true);
    setError(null);
    try {
      await submitComplaint({
        facilitySlug,
        isAnonymous,
        problemBlob,
        solutionBlob,
        nameBlob,
        problemText,
        solutionText,
        nameText,
      });
      navigate(`/${facilitySlug}/fertig`);
    } catch (err) {
      // Aufnahme bleibt im Store erhalten – Nutzer kann erneut senden (z. B. nach WLAN-Aussetzer).
      setError(err instanceof Error ? err.message : 'Senden fehlgeschlagen');
    } finally {
      setSending(false);
    }
  };

  return (
    <KioskFrame
      onHome={() => navigate(`/${facilitySlug}`)}
      topRight={<ReadAloudButton text="Möchtest du deine Beschwerde abschicken?" audioSrc={VOICELINES.confirm} autoPlay />}
      footer={
        <>
          {error && (
            <p className="rounded-2xl bg-red-50 px-5 py-4 text-center text-lg font-semibold text-red-700">
              {error}
            </p>
          )}
          <BigButton
            variant="amber"
            icon={<Play size={26} fill="currentColor" strokeWidth={0} />}
            onClick={playAll}
            disabled={sending}
          >
            Anhören
          </BigButton>
          <BigButton
            variant="success"
            icon={<Check size={28} strokeWidth={3} />}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Wird gesendet …' : 'Senden'}
          </BigButton>
          <BigButton
            variant="ghost"
            icon={<ArrowLeft size={26} strokeWidth={3} />}
            onClick={() => navigate(`/${facilitySlug}/name`)}
            disabled={sending}
          >
            Zurück
          </BigButton>
        </>
      }
      dots={{ step: 3, total: 4 }}
    >
      <h2 className="text-4xl font-extrabold text-gray-900">Abschicken?</h2>

      {(problemText || solutionText) && (
        <div className="flex w-full flex-col gap-3 text-left">
          {problemText && (
            <div className="rounded-2xl bg-gray-50 px-5 py-4">
              <p className="text-sm font-bold uppercase tracking-wide text-gray-400">Problem</p>
              <p className="text-lg font-semibold leading-snug text-gray-800">„{problemText}"</p>
            </div>
          )}
          {solutionText && (
            <div className="rounded-2xl bg-gray-50 px-5 py-4">
              <p className="text-sm font-bold uppercase tracking-wide text-gray-400">Idee</p>
              <p className="text-lg font-semibold leading-snug text-gray-800">„{solutionText}"</p>
            </div>
          )}
        </div>
      )}
    </KioskFrame>
  );
}
