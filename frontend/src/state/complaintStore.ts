import { create } from 'zustand';

interface ComplaintState {
  isAnonymous: boolean;
  setAnonymous: (value: boolean) => void;
  reset: () => void;
}

/**
 * Haelt die Beschwerde ueber die Screens hinweg, da React Router beim Navigieren
 * zwischen den 6 Frage-Screens jeweils unmounted. Aufnahme-/Transkriptions-Felder
 * kommen in Tag 2 hinzu (useRecorder/useTranscription), siehe Umsetzungsplan Abschnitt 3.
 */
export const useComplaintStore = create<ComplaintState>((set) => ({
  isAnonymous: true,
  setAnonymous: (value) => set({ isAnonymous: value }),
  reset: () => set({ isAnonymous: true }),
}));
