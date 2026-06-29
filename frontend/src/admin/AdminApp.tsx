import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './LoginScreen';
import { ComplaintList } from './ComplaintList';
import { ComplaintDetail } from './ComplaintDetail';

// Auth-Guard (Supabase Session Check) kommt in Tag 3, siehe Umsetzungsplan Abschnitt 5
export function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginScreen />} />
      <Route index element={<ComplaintList />} />
      <Route path="complaint/:id" element={<ComplaintDetail />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
