import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Play } from 'lucide-react';
import { BigButton } from '../components/BigButton';
import { KioskFrame } from '../components/KioskFrame';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { VOICELINES } from '../lib/voicelines';
import { stopCurrentPlayback } from '../lib/audioPlayback';
import { useFacilitySlug } from '../lib/facility';
import { useComplaintStore, type TranscriptionStatus } from '../state/complaintStore';
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

type Phase = 'idle' | 'waiting' | 'sending';

/** Zusammenfassungs-Karte je Feld: zeigt erkannten Text oder "wird noch erkannt …". */
function FieldCard({
  label,
  status,
  text,
  hasAudio,
}: {
  label: string;
  status: TranscriptionStatus;
  text: string;
  hasAudio: boolean;
}) {
  if (!text && !hasAudio) return null;
  return (
    <div className="rounded-2xl bg-gray-50 px-5 py-4">
      <p className="text-sm font-bold uppercase tracking-wide text-gray-400">{label}</p>
      {status === 'pending' ? (
        <p className="flex items-center gap-2 text-lg font-semibold text-gray-500">
          <Loader2 size={18} className="animate-spin" /> wird noch erkannt …
        </p>
      ) : text ? (
        <p className="text-lg font-semibold leading-snug text-gray-800">„{text}"</p>
      ) : (
        <p className="text-lg font-semibold text-gray-500">(per Audio aufgenommen)</p>
      )}
    </div>
  );
}

export function ConfirmScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const {
    problemBlob,
    solutionBlob,
    nameBlob,
    problemText,
    solutionText,
    problemStatus,
    solutionStatus,
    awaitTranscriptions,
  } = useComplaintStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const sending = phase !== 'idle';

  const playAll = () => {
    stopCurrentPlayback();
    const blobs = [problemBlob, solutionBlob, nameBlob].filter((b): b is Blob => b !== null);
    if (blobs.length > 0) void playSequentially(blobs);
  };

  const handleSend = async () => {
    if (!facilitySlug || sending) return;
    setError(null);
    try {
      // Falls noch erkannt wird: erst warten, bis alle Texte da sind, dann senden.
      const st = useComplaintStore.getState();
      const stillPending =
        st.problemStatus === 'pending' || st.solutionStatus === 'pending' || st.nameStatus === 'pending';
      if (stillPending) {
        setPhase('waiting');
        await awaitTranscriptions();
      }
      setPhase('sending');
      // Frische Werte aus dem Store (Transkription kann gerade erst fertig geworden sein).
      const s = useComplaintStore.getState();
      await submitComplaint({
        facilitySlug,
        isAnonymous: s.isAnonymous,
        problemBlob: s.problemBlob,
        solutionBlob: s.solutionBlob,
        nameBlob: s.nameBlob,
        problemText: s.problemText,
        solutionText: s.solutionText,
        nameText: s.nameText,
      });
      navigate(`/${facilitySlug}/fertig`);
    } catch (err) {
      // Aufnahme bleibt im Store erhalten – Nutzer kann erneut senden (z. B. nach WLAN-Aussetzer).
      setError(err instanceof Error ? err.message : 'Senden fehlgeschlagen');
      setPhase('idle');
    }
  };

  const sendLabel =
    phase === 'waiting' ? 'Warte auf Texterkennung …' : phase === 'sending' ? 'Wird gesendet …' : 'Senden';

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
            {sendLabel}
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

      <div className="flex w-full flex-col gap-3 text-left">
        <FieldCard label="Problem" status={problemStatus} text={problemText} hasAudio={!!problemBlob} />
        <FieldCard label="Idee" status={solutionStatus} text={solutionText} hasAudio={!!solutionBlob} />
      </div>
    </KioskFrame>
  );
}
