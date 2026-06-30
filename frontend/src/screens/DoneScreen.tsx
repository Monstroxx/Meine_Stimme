import { useNavigate } from 'react-router-dom';
import { Check, House } from 'lucide-react';
import { BigButton } from '../components/BigButton';
import { KioskFrame } from '../components/KioskFrame';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { VOICELINES } from '../lib/voicelines';
import { useComplaintStore } from '../state/complaintStore';
import { useFacilitySlug } from '../lib/facility';

export function DoneScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const reset = useComplaintStore((s) => s.reset);

  const handleRestart = () => {
    reset();
    navigate(`/${facilitySlug}`);
  };

  return (
    <KioskFrame
      topRight={<ReadAloudButton text="Fertig! Danke für deine Nachricht." audioSrc={VOICELINES.done} autoPlay />}
      footer={
        <BigButton icon={<House size={28} strokeWidth={2.5} />} onClick={handleRestart}>
          Nochmal
        </BigButton>
      }
    >
      <span className="flex h-64 w-64 items-center justify-center rounded-full bg-green-100">
        <span className="flex h-52 w-52 items-center justify-center rounded-full bg-brand-green text-white">
          <Check size={96} strokeWidth={3} />
        </span>
      </span>
      <h2 className="text-4xl font-extrabold text-gray-900">Fertig!</h2>
    </KioskFrame>
  );
}
