import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Play } from 'lucide-react';
import { BigButton } from '../components/BigButton';
import { KioskFrame } from '../components/KioskFrame';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { useFacilitySlug } from '../lib/facility';
import { useComplaintStore } from '../state/complaintStore';

export function ConfirmScreen() {
  const navigate = useNavigate();
  const facilitySlug = useFacilitySlug();
  const { problemBlob } = useComplaintStore();

  const playRecording = () => {
    if (problemBlob) new Audio(URL.createObjectURL(problemBlob)).play();
  };

  const handleSend = () => {
    // POST an /api/complaints kommt in Tag 3 (siehe Umsetzungsplan Abschnitt 4)
    navigate(`/${facilitySlug}/fertig`);
  };

  return (
    <KioskFrame
      onHome={() => navigate(`/${facilitySlug}`)}
      topRight={<ReadAloudButton text="Möchtest du deine Beschwerde abschicken?" autoPlay />}
      footer={
        <>
          <BigButton variant="amber" icon={<Play size={26} fill="currentColor" strokeWidth={0} />} onClick={playRecording}>
            Anhören
          </BigButton>
          <BigButton variant="success" icon={<Check size={28} strokeWidth={3} />} onClick={handleSend}>
            Senden
          </BigButton>
          <BigButton variant="ghost" icon={<ArrowLeft size={26} strokeWidth={3} />} onClick={() => navigate(`/${facilitySlug}/name`)}>
            Zurück
          </BigButton>
        </>
      }
      dots={{ step: 3, total: 4 }}
    >
      <h2 className="text-4xl font-extrabold text-gray-900">Abschicken?</h2>
    </KioskFrame>
  );
}
