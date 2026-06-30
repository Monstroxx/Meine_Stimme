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
  const { nameBlob, nameText, setAnonymous, setNameBlob, setNameText } = useComplaintStore();
  const [recording, setRecording] = useState(false);

  const goNext = () => navigate(`/${facilitySlug}/bestaetigen`);

  const chooseAnonymous = () => {
    setAnonymous(true);
    goNext();
  };

  const chooseName = () => {
    setAnonymous(false);
    setRecording(true);
  };

  return (
    <KioskFrame
      onHome={() => navigate(`/${facilitySlug}`)}
      footer={
        recording && (nameBlob || nameText.trim()) ? (
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

      {!recording && (
        <div className="flex w-full flex-col gap-4">
          <BigButton icon={<User size={28} strokeWidth={2.5} />} onClick={chooseName}>
            Name sagen
          </BigButton>
          <BigButton variant="ghost" icon={<Glasses size={28} strokeWidth={2.5} />} onClick={chooseAnonymous}>
            Anonym
          </BigButton>
        </div>
      )}

      {recording && (
        <div className="flex w-full flex-col items-center gap-4">
          <RecordControls onBlob={setNameBlob} onTranscript={setNameText} placeholder="Name eingeben …" />
          <button onClick={() => setRecording(false)} className="text-lg font-bold text-gray-500 underline">
            Zurück
          </button>
        </div>
      )}
    </KioskFrame>
  );
}
