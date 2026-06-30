import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Bei Erfolg uebernimmt onAuthStateChange in AdminApp den Rest (Re-Render zur Liste).
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Anmeldung fehlgeschlagen. E-Mail/Passwort prüfen.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-xl font-bold text-gray-900">Verwaltung — Anmeldung</h1>

        <label className="mb-1 block text-sm font-semibold text-gray-600" htmlFor="email">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base outline-none focus:border-brand-blue"
        />

        <label className="mb-1 block text-sm font-semibold text-gray-600" htmlFor="password">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base outline-none focus:border-brand-blue"
        />

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-blue px-4 py-3 text-base font-bold text-white active:brightness-95 disabled:opacity-60"
        >
          {loading ? 'Anmelden …' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
