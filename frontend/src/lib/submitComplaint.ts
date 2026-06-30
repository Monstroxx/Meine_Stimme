interface ComplaintPayload {
  facilitySlug: string;
  isAnonymous: boolean;
  problemBlob: Blob | null;
  solutionBlob: Blob | null;
  nameBlob: Blob | null;
  problemText: string;
  solutionText: string;
  nameText: string;
}

/**
 * Schickt die Beschwerde als multipart/form-data an die Vercel-Function /api/complaints.
 * Feldnamen muessen exakt zu api/complaints.ts passen.
 */
export async function submitComplaint(p: ComplaintPayload): Promise<void> {
  const form = new FormData();
  form.set('facility_slug', p.facilitySlug);
  form.set('is_anonymous', String(p.isAnonymous));

  if (p.problemText) form.set('problem_text', p.problemText);
  if (p.solutionText) form.set('solution_text', p.solutionText);
  if (!p.isAnonymous && p.nameText) form.set('name_text', p.nameText);

  if (p.problemBlob) form.set('problem_audio', p.problemBlob, 'problem.webm');
  if (p.solutionBlob) form.set('solution_audio', p.solutionBlob, 'solution.webm');
  if (!p.isAnonymous && p.nameBlob) form.set('name_audio', p.nameBlob, 'name.webm');

  const res = await fetch('/api/complaints', { method: 'POST', body: form });

  if (!res.ok) {
    let message = `Senden fehlgeschlagen (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // Antwort war kein JSON – generische Meldung behalten.
    }
    throw new Error(message);
  }
}
