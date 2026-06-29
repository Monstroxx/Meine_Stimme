import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { ProgressDots } from '../components/ProgressDots';
import { useFacilitySlug } from '../lib/facility';

export function ConfirmScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();

  const handleSend = () => {
    // POST an /api/complaints kommt in Tag 3 (siehe Umsetzungsplan Abschnitt 4)
    navigate(`/${facilitySlug}/fertig`);
  };

  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Abschicken?</h2>
        <div className="flex w-full max-w-md flex-col gap-3">
          <BigButton variant="ghost">▶ Anhören</BigButton>
          <BigButton variant="secondary" onClick={handleSend}>
            ✔ Senden
          </BigButton>
          <BigButton variant="ghost" onClick={() => navigate(`/${facilitySlug}/name`)}>
            ← Zurück
          </BigButton>
        </div>
      </div>
      <ProgressDots step={3} total={4} />
    </div>
  );
}
