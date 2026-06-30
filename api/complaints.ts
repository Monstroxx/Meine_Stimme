import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import formidable, { type File } from 'formidable';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { resend } from './_lib/resend.js';
import { getFacilityName, isValidFacilitySlug } from './_lib/facilityConfig.js';

// Vercel soll den Body nicht selbst parsen, da multipart/form-data (Audio-Anhaenge) durchkommt.
export const config = {
  api: { bodyParser: false },
};

const BUCKET = 'complaint-audio';

function field(fields: formidable.Fields, name: string): string | undefined {
  const value = fields[name];
  return Array.isArray(value) ? value[0] : value;
}

function file(files: formidable.Files, name: string): File | undefined {
  const value = files[name];
  return Array.isArray(value) ? value[0] : value;
}

async function uploadAudio(facilitySlug: string, complaintId: string, label: string, audio?: File) {
  if (!audio) return null;

  const buffer = await readFile(audio.filepath);
  const path = `${facilitySlug}/${complaintId}/${label}.webm`;
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: audio.mimetype ?? 'audio/webm' });

  if (error) throw new Error(`Audio-Upload (${label}) fehlgeschlagen: ${error.message}`);
  return { path, buffer };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const form = formidable({ maxFileSize: 25 * 1024 * 1024 });
  const [fields, files] = await form.parse(req);

  const facilitySlug = field(fields, 'facility_slug');
  const problemText = field(fields, 'problem_text');
  const solutionText = field(fields, 'solution_text');
  const isAnonymous = field(fields, 'is_anonymous') !== 'false';
  const nameText = isAnonymous ? undefined : field(fields, 'name_text');

  const problemAudioFile = file(files, 'problem_audio');
  const solutionAudioFile = file(files, 'solution_audio');
  const nameAudioFile = isAnonymous ? undefined : file(files, 'name_audio');

  if (!facilitySlug || !isValidFacilitySlug(facilitySlug)) {
    res.status(400).json({ ok: false, error: 'Ungueltige oder fehlende Einrichtung' });
    return;
  }

  if (!problemText && !problemAudioFile) {
    res.status(400).json({ ok: false, error: 'Problem/Beschwerde ist ein Pflichtfeld' });
    return;
  }

  const complaintId = randomUUID();

  try {
    const [problemAudio, solutionAudio, nameAudio] = await Promise.all([
      uploadAudio(facilitySlug, complaintId, 'problem', problemAudioFile),
      uploadAudio(facilitySlug, complaintId, 'solution', solutionAudioFile),
      uploadAudio(facilitySlug, complaintId, 'name', nameAudioFile),
    ]);

    const { error: insertError } = await supabaseAdmin.from('complaints').insert({
      id: complaintId,
      facility_slug: facilitySlug,
      problem_text: problemText ?? null,
      problem_audio_path: problemAudio?.path ?? null,
      solution_text: solutionText ?? null,
      solution_audio_path: solutionAudio?.path ?? null,
      is_anonymous: isAnonymous,
      name_text: nameText ?? null,
      name_audio_path: nameAudio?.path ?? null,
    });

    if (insertError) throw new Error(`Datenbank-Insert fehlgeschlagen: ${insertError.message}`);

    const recipient = process.env.COMPLAINT_RECIPIENT_EMAIL;
    if (!recipient) throw new Error('COMPLAINT_RECIPIENT_EMAIL ist nicht konfiguriert');

    const attachments: { filename: string; content: Buffer }[] = [];
    if (problemAudio) attachments.push({ filename: 'problem.webm', content: problemAudio.buffer });
    if (solutionAudio) attachments.push({ filename: 'loesung.webm', content: solutionAudio.buffer });
    if (nameAudio) attachments.push({ filename: 'name.webm', content: nameAudio.buffer });

    // Ohne eigene verifizierte Domain nutzt der Prototyp den Resend-Sandbox-Sender
    // (sendet nur an die Account-Adresse). Spaeter via RESEND_FROM auf eigene Domain umstellen.
    // Das Resend-SDK wirft bei API-Fehlern nicht, sondern liefert { error } – daher explizit pruefen,
    // sonst meldet die Funktion faelschlich 200, obwohl keine Mail rausging.
    const { data: mail, error: mailError } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Meine Stimme <onboarding@resend.dev>',
      to: recipient,
      subject: `Neue Beschwerde — ${getFacilityName(facilitySlug)}`,
      text: [
        `Einrichtung: ${getFacilityName(facilitySlug)}`,
        `Name: ${isAnonymous ? 'Anonym' : nameText ?? '(per Audio, siehe Anhang)'}`,
        '',
        'Problem/Beschwerde:',
        problemText ?? '(per Audio, siehe Anhang)',
        '',
        'Lösungsvorschlag/Idee:',
        solutionText ?? (solutionAudio ? '(per Audio, siehe Anhang)' : '(nicht angegeben)'),
      ].join('\n'),
      attachments,
    });

    if (mailError) {
      throw new Error(`Mail-Versand fehlgeschlagen: ${JSON.stringify(mailError)}`);
    }
    console.log('Mail an %s gesendet, Resend-ID: %s', recipient, mail?.id);

    res.status(200).json({ ok: true, id: complaintId });
  } catch (err) {
    console.error('Fehler beim Verarbeiten der Beschwerde', err);
    res.status(500).json({ ok: false, error: 'Beschwerde konnte nicht verarbeitet werden' });
  }
}
