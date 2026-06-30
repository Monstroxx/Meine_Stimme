import { create } from 'zustand';

interface ComplaintState {
  isAnonymous: boolean;
  problemBlob: Blob | null;
  solutionBlob: Blob | null;
  nameBlob: Blob | null;
  setAnonymous: (value: boolean) => void;
  setProblemBlob: (blob: Blob) => void;
  setSolutionBlob: (blob: Blob) => void;
  setNameBlob: (blob: Blob) => void;
  reset: () => void;
}

export const useComplaintStore = create<ComplaintState>((set) => ({
  isAnonymous: true,
  problemBlob: null,
  solutionBlob: null,
  nameBlob: null,
  setAnonymous: (value) => set({ isAnonymous: value }),
  setProblemBlob: (blob) => set({ problemBlob: blob }),
  setSolutionBlob: (blob) => set({ solutionBlob: blob }),
  setNameBlob: (blob) => set({ nameBlob: blob }),
  reset: () => set({ isAnonymous: true, problemBlob: null, solutionBlob: null, nameBlob: null }),
}));
