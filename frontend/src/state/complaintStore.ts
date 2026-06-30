import { create } from 'zustand';

interface ComplaintState {
  isAnonymous: boolean;
  problemBlob: Blob | null;
  solutionBlob: Blob | null;
  nameBlob: Blob | null;
  problemText: string;
  solutionText: string;
  nameText: string;
  setAnonymous: (value: boolean) => void;
  setProblemBlob: (blob: Blob) => void;
  setSolutionBlob: (blob: Blob) => void;
  setNameBlob: (blob: Blob) => void;
  setProblemText: (text: string) => void;
  setSolutionText: (text: string) => void;
  setNameText: (text: string) => void;
  reset: () => void;
}

export const useComplaintStore = create<ComplaintState>((set) => ({
  isAnonymous: true,
  problemBlob: null,
  solutionBlob: null,
  nameBlob: null,
  problemText: '',
  solutionText: '',
  nameText: '',
  setAnonymous: (value) => set({ isAnonymous: value }),
  setProblemBlob: (blob) => set({ problemBlob: blob }),
  setSolutionBlob: (blob) => set({ solutionBlob: blob }),
  setNameBlob: (blob) => set({ nameBlob: blob }),
  setProblemText: (text) => set({ problemText: text }),
  setSolutionText: (text) => set({ solutionText: text }),
  setNameText: (text) => set({ nameText: text }),
  reset: () =>
    set({
      isAnonymous: true,
      problemBlob: null,
      solutionBlob: null,
      nameBlob: null,
      problemText: '',
      solutionText: '',
      nameText: '',
    }),
}));
