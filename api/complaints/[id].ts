import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';

const ALLOWED_STATUSES = ['offen', 'in_bearbeitung', 'erledigt'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const id = req.query.id as string;
  const status = (req.body as { status?: string } | undefined)?.status;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    res.status(400).json({ ok: false, error: 'Ungueltiger Status' });
    return;
  }

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
    .select('facility_slug')
    .eq('user_id', userData.user.id)
    .single();

  if (!staff) {
    res.status(403).json({ ok: false, error: 'Kein Zugriff' });
    return;
  }

  const { data: complaint } = await supabaseAdmin
    .from('complaints')
    .select('facility_slug')
    .eq('id', id)
    .single();

  if (!complaint) {
    res.status(404).json({ ok: false, error: 'Beschwerde nicht gefunden' });
    return;
  }

  const hasAccess = staff.facility_slug === null || staff.facility_slug === complaint.facility_slug;
  if (!hasAccess) {
    res.status(403).json({ ok: false, error: 'Kein Zugriff auf diese Einrichtung' });
    return;
  }

  const { error: updateError } = await supabaseAdmin.from('complaints').update({ status }).eq('id', id);

  if (updateError) {
    res.status(500).json({ ok: false, error: 'Status konnte nicht aktualisiert werden' });
    return;
  }

  res.status(200).json({ ok: true });
}
