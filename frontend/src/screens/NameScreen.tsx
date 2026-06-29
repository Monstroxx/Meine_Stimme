import { useNavigate, useParams } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { ProgressDots } from '../components/ProgressDots';
import { useComplaintStore } from '../state/complaintStore';

export function NameScreen() {
  const navigate = useNavigate();
  const { facilitySlug } = useParams();
  const setAnonymous = useComplaintStore((s) => s.setAnonymous);

  const choose = (anonymous: boolean) => {
    setAnonymous(anonymous);
    navigate(`/${facilitySlug}/bestaetigen`);
  };

  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Dein Name?</h2>
        <div className="flex w-full max-w-md flex-col gap-3">
          <BigButton onClick={() => choose(false)}>👤 Name sagen</BigButton>
          <BigButton variant="ghost" onClick={() => choose(true)}>
            🙈 Anonym
          </BigButton>
        </div>
        {/* Hinweis "Stimme kann erkennbar sein" wird hier bei Anonym-Wahl ergaenzt (Tag 2) */}
      </div>
      <ProgressDots step={2} total={4} />
    </div>
  );
}
