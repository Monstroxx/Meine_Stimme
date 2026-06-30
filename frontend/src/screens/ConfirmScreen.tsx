import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Play } from 'lucide-react';
import { BigButton } from '../components/BigButton';
import { KioskFrame } from '../components/KioskFrame';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { useFacilitySlug } from '../lib/facility';
import { useComplaintStore } from '../state/complaintStore';

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
  const { problemBlob, solutionBlob, nameBlob, problemText, solutionText } = useComplaintStore();

  const playAll = () => {
    const blobs = [problemBlob, solutionBlob, nameBlob].filter((b): b is Blob => b !== null);
    if (blobs.length > 0) void playSequentially(blobs);
  };

  const handleSend = () => {
    // POST an /api/complaints kommt in Tag 3 (siehe Umsetzungsplan Abschnitt 4)
    navigate(`/${facilitySlug}/fertig`);
  };

  return (
    <KioskFrame
      onHome={() => navigate(`/${facilitySlug}`)}
      topRight={<ReadAloudButton text="Möchtest du deine Beschwerde abschicken?" autoPlay />}
      footer={
        <>
          <BigButton variant="amber" icon={<Play size={26} fill="currentColor" strokeWidth={0} />} onClick={playAll}>
            Anhören
          </BigButton>
          <BigButton variant="success" icon={<Check size={28} strokeWidth={3} />} onClick={handleSend}>
            Senden
          </BigButton>
          <BigButton variant="ghost" icon={<ArrowLeft size={26} strokeWidth={3} />} onClick={() => navigate(`/${facilitySlug}/name`)}>
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
