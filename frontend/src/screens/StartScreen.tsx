import { useNavigate } from 'react-router-dom';
import { KioskFrame } from '../components/KioskFrame';
import { MicButton } from '../components/MicButton';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { useFacilitySlug } from '../lib/facility';
import { VOICELINES } from '../lib/voicelines';

export function StartScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();

  const start = () => navigate(`/${facilitySlug}/problem`);

  return (
    <KioskFrame topRight={<ReadAloudButton text="Drücke auf das Mikrofon, um zu sprechen." audioSrc={VOICELINES.start} autoPlay />}>
      <MicButton state="idle" onClick={start} size="lg" label="Sprechen" />
    </KioskFrame>
  );
}
