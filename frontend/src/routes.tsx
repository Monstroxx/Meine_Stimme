import { Routes, Route } from 'react-router-dom';
import { StartScreen } from './screens/StartScreen';
import { ProblemScreen } from './screens/ProblemScreen';
import { SolutionScreen } from './screens/SolutionScreen';
import { NameScreen } from './screens/NameScreen';
import { ConfirmScreen } from './screens/ConfirmScreen';
import { DoneScreen } from './screens/DoneScreen';
import { AdminApp } from './admin/AdminApp';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/:facilitySlug" element={<StartScreen />} />
      <Route path="/:facilitySlug/problem" element={<ProblemScreen />} />
      <Route path="/:facilitySlug/loesung" element={<SolutionScreen />} />
      <Route path="/:facilitySlug/name" element={<NameScreen />} />
      <Route path="/:facilitySlug/bestaetigen" element={<ConfirmScreen />} />
      <Route path="/:facilitySlug/fertig" element={<DoneScreen />} />
    </Routes>
  );
}
