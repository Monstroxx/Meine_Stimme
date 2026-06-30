import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { ProgressDots } from '../components/ProgressDots';
import { RecordControls } from '../components/RecordControls';
import { useFacilitySlug } from '../lib/facility';
import { useComplaintStore } from '../state/complaintStore';

export function SolutionScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const { solutionBlob, setSolutionBlob } = useComplaintStore();
  const goNext = () => navigate(`/${facilitySlug}/name`);

  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Hast du eine Idee?</h2>
        <RecordControls
          question="Hast du eine Idee, wie das besser werden könnte?"
          onBlob={setSolutionBlob}
        />
        <div className="flex w-full max-w-md gap-3">
          <BigButton variant="ghost" onClick={goNext}>
            Überspringen
          </BigButton>
          {solutionBlob && <BigButton onClick={goNext}>Weiter</BigButton>}
        </div>
      </div>
      <ProgressDots step={1} total={4} />
    </div>
  );
}
