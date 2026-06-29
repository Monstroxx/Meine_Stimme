import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-100 text-5xl">
        ✔
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Fertig!</h2>
      <BigButton onClick={handleRestart} className="max-w-md">
        🏠 Nochmal
      </BigButton>
    </div>
  );
}
