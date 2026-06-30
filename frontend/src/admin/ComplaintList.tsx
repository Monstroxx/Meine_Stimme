import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Mic } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import {
  fetchComplaints,
  STATUS_META,
  STATUS_ORDER,
  type Complaint,
  type ComplaintStatus,
  type StaffInfo,
} from './adminApi';

type Filter = ComplaintStatus | 'alle';

interface Props {
  staff: StaffInfo | null;
  email: string;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ComplaintList({ staff, email }: Props) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('alle');

  useEffect(() => {
    fetchComplaints()
      .then(setComplaints)
      .catch((e) => setError(e instanceof Error ? e.message : 'Fehler beim Laden'))
      .finally(() => setLoading(false));
  }, []);

  const visible = complaints.filter((c) => filter === 'alle' || c.status === filter);

  return (
    <div className="mx-auto min-h-svh max-w-2xl bg-gray-50 p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Beschwerden</h1>
          <p className="text-sm text-gray-500">
            {email}
            {staff?.role === 'leitung'
              ? ' · Leitung (alle Einrichtungen)'
              : staff?.facility_slug
                ? ` · ${staff.facility_slug}`
                : ''}
          </p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 active:bg-gray-100"
        >
          <LogOut size={18} strokeWidth={2.5} /> Abmelden
        </button>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {(['alle', ...STATUS_ORDER] as Filter[]).map((f) => {
          const active = filter === f;
          const label = f === 'alle' ? 'Alle' : STATUS_META[f].label;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                active ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 border-2 border-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading && <p className="text-gray-400">Lädt …</p>}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      )}

      {!loading && !error && visible.length === 0 && (
        <p className="rounded-xl bg-white px-4 py-6 text-center text-gray-400">
          Keine Beschwerden in dieser Ansicht.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {visible.map((c) => {
          const meta = STATUS_META[c.status];
          const hasAudio = c.problem_audio_path || c.solution_audio_path || c.name_audio_path;
          return (
            <li key={c.id}>
              <Link
                to={`complaint/${c.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${meta.badge}`}>
                    {meta.label}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    {hasAudio && <Mic size={14} strokeWidth={2.5} />}
                    {shortDate(c.created_at)}
                  </span>
                </div>
                <p className="line-clamp-2 font-semibold text-gray-800">
                  {c.problem_text || '(nur Audio – zum Anhören öffnen)'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {c.is_anonymous ? 'Anonym' : c.name_text || 'Name per Audio'} · {c.facility_slug}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
