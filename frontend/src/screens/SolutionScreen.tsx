import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { ProgressDots } from '../components/ProgressDots';
import { useFacilitySlug } from '../lib/facility';

export function SolutionScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const goNext = () => navigate(`/${facilitySlug}/name`);

  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Deine Idee?</h2>
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-red-100 text-5xl">
          🎤
        </div>
        <div className="flex w-full max-w-md gap-3">
          <BigButton variant="ghost" onClick={goNext}>
            Überspringen
          </BigButton>
          <BigButton onClick={goNext}>Weiter</BigButton>
        </div>
      </div>
      <ProgressDots step={1} total={4} />
    </div>
  );
}
