import { supabase } from '../lib/supabaseClient';

export type ComplaintStatus = 'offen' | 'in_bearbeitung' | 'erledigt';
export type AudioField = 'problem' | 'solution' | 'name';

export const STATUS_ORDER: ComplaintStatus[] = ['offen', 'in_bearbeitung', 'erledigt'];

export const STATUS_META: Record<ComplaintStatus, { label: string; badge: string }> = {
  offen: { label: 'Offen', badge: 'bg-red-100 text-red-700' },
  in_bearbeitung: { label: 'In Bearbeitung', badge: 'bg-amber-100 text-amber-800' },
  erledigt: { label: 'Erledigt', badge: 'bg-green-100 text-green-700' },
};

export interface StaffInfo {
  facility_slug: string | null;
  role: 'betreuer' | 'leitung';
}

export interface Complaint {
  id: string;
  facility_slug: string;
  problem_text: string | null;
  problem_audio_path: string | null;
  solution_text: string | null;
  solution_audio_path: string | null;
  is_anonymous: boolean;
  name_text: string | null;
  name_audio_path: string | null;
  status: ComplaintStatus;
  created_at: string;
}

// Bearer-Token der aktuellen Supabase-Session – wird von den geschuetzten api/-Endpunkten geprueft.
async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Nicht angemeldet');
  return { Authorization: `Bearer ${token}` };
}

/** Beschwerden der eigenen Einrichtung (RLS filtert serverseitig nach staff.facility_slug). */
export async function fetchComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Complaint[];
}

export async function fetchComplaint(id: string): Promise<Complaint | null> {
  const { data, error } = await supabase.from('complaints').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Complaint | null) ?? null;
}

export async function updateStatus(id: string, status: ComplaintStatus): Promise<void> {
  const res = await fetch(`/api/complaints/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Status konnte nicht geändert werden');
  }
}

/** Beschwerde inkl. Audiodateien loeschen (nur Personal der eigenen Einrichtung). */
export async function deleteComplaint(id: string): Promise<void> {
  const res = await fetch(`/api/complaints/${id}`, {
    method: 'DELETE',
    headers: await authHeader(),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Beschwerde konnte nicht gelöscht werden');
  }
}

/** Kurzlebige signierte URL fuer ein Audio; serverseitig inkl. Anonym-Sperre geprueft. */
export async function getAudioUrl(complaintId: string, field: AudioField): Promise<string> {
  const params = new URLSearchParams({ complaintId, field });
  const res = await fetch(`/api/audio-url?${params}`, { headers: await authHeader() });
  const body = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !body?.url) {
    throw new Error(body?.error ?? 'Audio konnte nicht geladen werden');
  }
  return body.url;
}
