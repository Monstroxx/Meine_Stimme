import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

const BUCKET = 'complaint-audio';
const SIGNED_URL_TTL_SECONDS = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const complaintId = req.query.complaintId as string;
  const field = req.query.field as string; // 'problem' | 'solution' | 'name'

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ ok: false, error: 'Nicht angemeldet' });
    return;
  }

  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !userData.user) {
    res.status(401).json({ ok: false, error: 'Sitzung ungueltig' });
    return;
  }

  const { data: staff } = await supabaseAdmin
    .from('staff')
    .select('facility_slug, role')
    .eq('user_id', userData.user.id)
    .single();

  const { data: complaint } = await supabaseAdmin
    .from('complaints')
    .select('facility_slug, is_anonymous, problem_audio_path, solution_audio_path, name_audio_path')
    .eq('id', complaintId)
    .single();

  if (!staff || !complaint) {
    res.status(404).json({ ok: false, error: 'Nicht gefunden' });
    return;
  }

  const sameFacility = staff.facility_slug === null || staff.facility_slug === complaint.facility_slug;
  // Stimme ist auch bei "anonym" erkennbar (siehe docs Abschnitt 10) - Zugriff auf das Audio
  // dann nur fuer die Leitung, nicht fuer jede Betreuungsperson der Einrichtung.
  const anonymityGateOk = !complaint.is_anonymous || staff.role === 'leitung';

  if (!sameFacility || !anonymityGateOk) {
    res.status(403).json({ ok: false, error: 'Kein Zugriff auf dieses Audio' });
    return;
  }

  const pathByField: Record<string, string | null> = {
    problem: complaint.problem_audio_path,
    solution: complaint.solution_audio_path,
    name: complaint.name_audio_path,
  };
  const path = pathByField[field];

  if (!path) {
    res.status(404).json({ ok: false, error: 'Kein Audio fuer dieses Feld vorhanden' });
    return;
  }

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    res.status(500).json({ ok: false, error: 'Signierte URL konnte nicht erstellt werden' });
    return;
  }

  res.status(200).json({ ok: true, url: data.signedUrl });
}
