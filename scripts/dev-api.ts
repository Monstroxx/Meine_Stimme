/**
 * Lokaler API-Dev-Server fuer die Entwicklung ohne Vercel.
 * Fuehrt die Handler aus api/ mit der echten .env aus und lauscht auf Port 3000,
 * den der Vite-Dev-Proxy (frontend/vite.config.ts) fuer /api erwartet.
 *
 * Start:  npm run dev:api    (parallel zu  npm run dev)
 */
import http from 'node:http';
import { config } from 'dotenv';

config({ path: new URL('../.env', import.meta.url).pathname });

type Handler = (req: any, res: any) => unknown;

// Vercel-aehnliche Helfer an Node-Response haengen.
function adaptRes(res: http.ServerResponse) {
  const r = res as any;
  r.status = (code: number) => {
    res.statusCode = code;
    return r;
  };
  r.json = (body: unknown) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(body));
    return r;
  };
  return r;
}

async function route(pathname: string): Promise<{ handler: Handler; params: Record<string, string> } | null> {
  if (pathname === '/api/complaints') {
    const mod = await import('../api/complaints.ts');
    return { handler: mod.default as Handler, params: {} };
  }
  if (pathname === '/api/audio-url') {
    const mod = await import('../api/audio-url.ts');
    return { handler: mod.default as Handler, params: {} };
  }
  const idMatch = pathname.match(/^\/api\/complaints\/([^/]+)$/);
  if (idMatch) {
    const mod = await import('../api/complaints/[id].ts');
    return { handler: mod.default as Handler, params: { id: decodeURIComponent(idMatch[1]) } };
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const matched = await route(url.pathname);

  if (!matched) {
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: 'Not found' }));
    return;
  }

  // req.query wie bei Vercel bereitstellen (Query-Params + Pfad-Params).
  (req as any).query = {
    ...Object.fromEntries(url.searchParams),
    ...matched.params,
  };

  // JSON-Body parsen fuer PATCH /api/complaints/:id (komplaints.ts nutzt formidable und
  // liest den Stream selbst – dort den Body NICHT vorab konsumieren).
  const contentType = req.headers['content-type'] ?? '';
  if (contentType.includes('application/json')) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks).toString('utf8');
    (req as any).body = raw ? JSON.parse(raw) : {};
  }

  try {
    await matched.handler(req, adaptRes(res));
  } catch (err) {
    console.error('Handler-Fehler', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: 'Interner Fehler' }));
    }
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`API-Dev-Server läuft auf http://localhost:${PORT}`);
});
