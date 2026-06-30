import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronsRight } from 'lucide-react';
import { BigButton } from '../components/BigButton';
import { KioskFrame } from '../components/KioskFrame';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { VOICELINES } from '../lib/voicelines';
import { RecordControls } from '../components/RecordControls';
import { useFacilitySlug } from '../lib/facility';

const QUESTION = 'Hast du eine Idee, wie es besser werden könnte?';

export function SolutionScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const goNext = () => navigate(`/${facilitySlug}/name`);

  return (
    <KioskFrame
      onHome={() => navigate(`/${facilitySlug}`)}
      footer={
        <div className="flex w-full gap-4">
          <BigButton
            variant="ghost"
            onClick={goNext}
            aria-label="Überspringen"
            className="!w-24 flex-none"
          >
            <ChevronsRight size={28} strokeWidth={3} />
          </BigButton>
          <BigButton
            icon={<ArrowRight size={28} strokeWidth={3} />}
            onClick={goNext}
            className="!w-auto flex-1"
          >
            Weiter
          </BigButton>
        </div>
      }
      dots={{ step: 1, total: 4 }}
    >
      <div className="flex flex-col items-center gap-4">
        <ReadAloudButton text={QUESTION} audioSrc={VOICELINES.solution} autoPlay halo />
        <h2 className="text-4xl font-extrabold text-gray-900">Deine Idee?</h2>
      </div>
      <RecordControls field="solution" />
    </KioskFrame>
  );
}
