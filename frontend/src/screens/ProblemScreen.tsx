import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BigButton } from '../components/BigButton';
import { KioskFrame } from '../components/KioskFrame';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { VOICELINES } from '../lib/voicelines';
import { RecordControls } from '../components/RecordControls';
import { useFacilitySlug } from '../lib/facility';
import { useComplaintStore } from '../state/complaintStore';

const QUESTION = 'Was ist los? Erzähl, was dich stört.';

export function ProblemScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const { problemBlob, problemText } = useComplaintStore();

  return (
    <KioskFrame
      onHome={() => navigate(`/${facilitySlug}`)}
      footer={
        problemBlob || problemText.trim() ? (
          <BigButton icon={<ArrowRight size={28} strokeWidth={3} />} onClick={() => navigate(`/${facilitySlug}/loesung`)}>
            Weiter
          </BigButton>
        ) : null
      }
      dots={{ step: 0, total: 4 }}
    >
      <div className="flex flex-col items-center gap-4">
        <ReadAloudButton text={QUESTION} audioSrc={VOICELINES.problem} autoPlay halo />
        <h2 className="text-4xl font-extrabold text-gray-900">Was ist los?</h2>
      </div>
      <RecordControls field="problem" />
    </KioskFrame>
  );
}
