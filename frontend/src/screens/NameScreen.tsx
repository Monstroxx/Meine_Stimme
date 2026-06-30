import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Glasses, User } from 'lucide-react';
import { BigButton } from '../components/BigButton';
import { KioskFrame } from '../components/KioskFrame';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { RecordControls } from '../components/RecordControls';
import { useComplaintStore } from '../state/complaintStore';
import { useFacilitySlug } from '../lib/facility';

const QUESTION = 'Wie heißt du? Du kannst auch anonym bleiben.';

export function NameScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const { isAnonymous, nameBlob, setAnonymous, setNameBlob } = useComplaintStore();
  const [chosen, setChosen] = useState(false);

  const goNext = () => navigate(`/${facilitySlug}/bestaetigen`);
  const canContinue = chosen && (isAnonymous || nameBlob !== null);

  return (
    <KioskFrame
      onHome={() => navigate(`/${facilitySlug}`)}
      footer={
        canContinue ? (
          <BigButton icon={<ArrowRight size={28} strokeWidth={3} />} onClick={goNext}>
            Weiter
          </BigButton>
        ) : null
      }
      dots={{ step: 2, total: 4 }}
    >
      <div className="flex flex-col items-center gap-4">
        <ReadAloudButton text={QUESTION} autoPlay halo />
        <h2 className="text-4xl font-extrabold text-gray-900">Dein Name?</h2>
      </div>

      {!chosen && (
        <div className="flex w-full flex-col gap-4">
          <BigButton
            icon={<User size={28} strokeWidth={2.5} />}
            onClick={() => {
              setAnonymous(false);
              setChosen(true);
            }}
          >
            Name sagen
          </BigButton>
          <BigButton
            variant="ghost"
            icon={<Glasses size={28} strokeWidth={2.5} />}
            onClick={() => {
              setAnonymous(true);
              setChosen(true);
            }}
          >
            Anonym
          </BigButton>
        </div>
      )}

      {chosen && isAnonymous && (
        <div className="flex w-full flex-col items-center gap-4">
          {/* Ethik-Hinweis: Stimme bleibt auch bei "anonym" erkennbar (Brainstorming Abschnitt 10) */}
          <p className="rounded-2xl bg-yellow-50 px-5 py-4 text-lg font-semibold text-yellow-800">
            Auch wenn du anonym bleibst, kann deine Stimme erkennbar sein. Nur die Leitung hört deine Aufnahme.
          </p>
          <button onClick={() => setChosen(false)} className="text-lg font-bold text-gray-500 underline">
            Zurück
          </button>
        </div>
      )}

      {chosen && !isAnonymous && (
        <div className="flex w-full flex-col items-center gap-4">
          <RecordControls onBlob={setNameBlob} />
          <button onClick={() => setChosen(false)} className="text-lg font-bold text-gray-500 underline">
            Zurück
          </button>
        </div>
      )}
    </KioskFrame>
  );
}
