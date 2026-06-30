import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { LoginScreen } from './LoginScreen';
import { ComplaintList } from './ComplaintList';
import { ComplaintDetail } from './ComplaintDetail';
import type { StaffInfo } from './adminApi';

export function AdminApp() {
  // undefined = Session-Status wird noch geladen
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [staff, setStaff] = useState<StaffInfo | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setStaff(null);
      return;
    }
    supabase
      .from('staff')
      .select('facility_slug, role')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setStaff((data as StaffInfo | null) ?? null));
  }, [session]);

  if (session === undefined) {
    return <div className="flex min-h-svh items-center justify-center text-gray-400">Lädt …</div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route index element={<ComplaintList staff={staff} email={session.user.email ?? ''} />} />
      <Route path="complaint/:id" element={<ComplaintDetail staff={staff} />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
