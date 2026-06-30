import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { ProgressDots } from '../components/ProgressDots';
import { RecordControls } from '../components/RecordControls';
import { useFacilitySlug } from '../lib/facility';
import { useComplaintStore } from '../state/complaintStore';

export function ProblemScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const { problemBlob, setProblemBlob } = useComplaintStore();

  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Was ist los?</h2>
        <RecordControls
          question="Was ist los? Beschreibe dein Problem."
          onBlob={setProblemBlob}
        />
        {problemBlob && (
          <BigButton onClick={() => navigate(`/${facilitySlug}/loesung`)} className="max-w-md">
            Weiter
          </BigButton>
        )}
      </div>
      <ProgressDots step={0} total={4} />
    </div>
  );
}
