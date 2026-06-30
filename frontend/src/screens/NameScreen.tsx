import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { ProgressDots } from '../components/ProgressDots';
import { RecordControls } from '../components/RecordControls';
import { useComplaintStore } from '../state/complaintStore';
import { useFacilitySlug } from '../lib/facility';

export function NameScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const { isAnonymous, nameBlob, setAnonymous, setNameBlob } = useComplaintStore();
  const [chosen, setChosen] = useState(false);

  const chooseAnonymous = () => {
    setAnonymous(true);
    setChosen(true);
  };

  const chooseName = () => {
    setAnonymous(false);
    setChosen(true);
  };

  const goNext = () => navigate(`/${facilitySlug}/bestaetigen`);

  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Dein Name?</h2>

        {!chosen && (
          <div className="flex w-full max-w-md flex-col gap-3">
            <BigButton onClick={chooseName}>👤 Name sagen</BigButton>
            <BigButton variant="ghost" onClick={chooseAnonymous}>
              🙈 Anonym bleiben
            </BigButton>
          </div>
        )}

        {chosen && isAnonymous && (
          <div className="flex w-full max-w-md flex-col gap-4">
            {/* Ethik-Hinweis: Stimme bleibt auch bei "anonym" erkennbar (Brainstorming Abschnitt 10) */}
            <p className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              Auch wenn du anonym bleibst, kann deine Stimme erkennbar sein.
              Nur die Leitung hört deine Aufnahme.
            </p>
            <BigButton onClick={goNext}>Weiter ohne Namen</BigButton>
            <BigButton variant="ghost" onClick={() => setChosen(false)}>
              Zurück
            </BigButton>
          </div>
        )}

        {chosen && !isAnonymous && (
          <div className="flex w-full max-w-md flex-col gap-4">
            <RecordControls
              question="Wie heißt du? Sag bitte deinen Namen."
              onBlob={setNameBlob}
            />
            {nameBlob && <BigButton onClick={goNext}>Weiter</BigButton>}
            <BigButton variant="ghost" onClick={() => setChosen(false)}>
              Zurück
            </BigButton>
          </div>
        )}
      </div>
      <ProgressDots step={2} total={4} />
    </div>
  );
}
