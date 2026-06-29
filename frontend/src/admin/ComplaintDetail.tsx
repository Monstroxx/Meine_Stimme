import { useParams } from 'react-router-dom';

export function ComplaintDetail() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold text-gray-900">Beschwerde {id}</h1>
      <p className="text-sm text-gray-500">
        Volltext, Status-Aenderung und Audio-Wiedergabe (mit Anonym-Sperre via
        /api/audio-url) folgen in Tag 4 (siehe Umsetzungsplan Abschnitt 5).
      </p>
    </div>
  );
}
