import { useNavigate, useParams } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { ProgressDots } from '../components/ProgressDots';

export function ProblemScreen() {
  const navigate = useNavigate();
  const { facilitySlug } = useParams();

  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Was ist los?</h2>
        {/* Mikro-Aufnahme + Vorlesen kommen in Tag 2 (useRecorder/useReadAloud) */}
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-red-100 text-5xl">
          🎤
        </div>
        <BigButton onClick={() => navigate(`/${facilitySlug}/loesung`)} className="max-w-md">
          Weiter
        </BigButton>
      </div>
      <ProgressDots step={0} total={4} />
    </div>
  );
}
