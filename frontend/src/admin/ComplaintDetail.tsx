import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import {
  deleteComplaint,
  fetchComplaint,
  updateStatus,
  STATUS_META,
  STATUS_ORDER,
  type Complaint,
  type ComplaintStatus,
  type StaffInfo,
} from './adminApi';
import { AdminAudioPlayer } from './AdminAudioPlayer';

interface Props {
  staff: StaffInfo | null;
}

export function ComplaintDetail({ staff }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchComplaint(id)
      .then(setComplaint)
      .catch((e) => setError(e instanceof Error ? e.message : 'Fehler beim Laden'))
      .finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (status: ComplaintStatus) => {
    if (!id || !complaint) return;
    setSaving(true);
    setError(null);
    try {
      await updateStatus(id, status);
      setComplaint({ ...complaint, status });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Status konnte nicht geändert werden');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteComplaint(id);
      navigate('/admin');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Beschwerde konnte nicht gelöscht werden');
      setDeleting(false);
    }
  };

  // Stimme ist auch bei "anonym" erkennbar – Audio dann nur fuer die Leitung (siehe docs Abschnitt 10).
  const audioLocked = !!complaint?.is_anonymous && staff?.role !== 'leitung';

  return (
    <div className="mx-auto min-h-svh max-w-2xl bg-gray-50 p-6">
      <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-500">
        <ArrowLeft size={18} strokeWidth={2.5} /> Zurück zur Liste
      </Link>

      {loading && <p className="text-gray-400">Lädt …</p>}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      )}

      {complaint && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_META[complaint.status].badge}`}>
              {STATUS_META[complaint.status].label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(complaint.created_at).toLocaleString('de-DE')} · {complaint.facility_slug}
            </span>
          </div>

          <Section title="Problem / Beschwerde">
            <p className="font-semibold text-gray-800">
              {complaint.problem_text || <em className="text-gray-400">Nur als Audio aufgenommen</em>}
            </p>
            {complaint.problem_audio_path && (
              <div className="mt-3">
                <AdminAudioPlayer complaintId={complaint.id} field="problem" label="Problem anhören" disabled={audioLocked} />
              </div>
            )}
          </Section>

          <Section title="Idee / Lösungsvorschlag">
            <p className="font-semibold text-gray-800">
              {complaint.solution_text || (
                <em className="text-gray-400">
                  {complaint.solution_audio_path ? 'Nur als Audio aufgenommen' : 'Nicht angegeben'}
                </em>
              )}
            </p>
            {complaint.solution_audio_path && (
              <div className="mt-3">
                <AdminAudioPlayer complaintId={complaint.id} field="solution" label="Idee anhören" disabled={audioLocked} />
              </div>
            )}
          </Section>

          <Section title="Name">
            {complaint.is_anonymous ? (
              <p className="font-semibold text-gray-500">Anonym abgegeben</p>
            ) : (
              <p className="font-semibold text-gray-800">
                {complaint.name_text || <em className="text-gray-400">Nur als Audio aufgenommen</em>}
              </p>
            )}
            {complaint.name_audio_path && (
              <div className="mt-3">
                <AdminAudioPlayer complaintId={complaint.id} field="name" label="Name anhören" disabled={audioLocked} />
              </div>
            )}
          </Section>

          {audioLocked && (
            <p className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
              Diese Beschwerde wurde anonym abgegeben. Die Aufnahmen kann nur die Leitung anhören,
              da die Stimme erkennbar sein könnte.
            </p>
          )}

          <Section title="Status ändern">
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map((s) => {
                const active = complaint.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    disabled={saving || active}
                    className={`rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-60 ${
                      active ? 'bg-brand-blue text-white' : 'bg-white text-gray-700 border-2 border-gray-200'
                    }`}
                  >
                    {STATUS_META[s].label}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Beschwerde löschen">
            {confirmDelete ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-700">
                  Diese Beschwerde und alle Aufnahmen werden endgültig gelöscht. Fortfahren?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white active:brightness-95 disabled:opacity-60"
                  >
                    <Trash2 size={16} strokeWidth={2.5} /> {deleting ? 'Wird gelöscht …' : 'Endgültig löschen'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 disabled:opacity-60"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 active:bg-red-50"
              >
                <Trash2 size={16} strokeWidth={2.5} /> Beschwerde löschen
              </button>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{title}</p>
      {children}
    </div>
  );
}
