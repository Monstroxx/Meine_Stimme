import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { useFacilitySlug } from '../lib/facility';

export function StartScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Meine Stimme</h1>
      <BigButton onClick={() => navigate(`/${facilitySlug}/problem`)} className="max-w-md">
        Beschwerde abgeben
      </BigButton>
    </div>
  );
}
