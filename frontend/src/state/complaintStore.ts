import { create } from 'zustand';
import { transcribeBlob } from '../lib/transcriber';

export type Field = 'problem' | 'solution' | 'name';
export type TranscriptionStatus = 'idle' | 'pending' | 'done' | 'error';

interface ComplaintState {
  isAnonymous: boolean;
  problemBlob: Blob | null;
  solutionBlob: Blob | null;
  nameBlob: Blob | null;
  problemText: string;
  solutionText: string;
  nameText: string;
  problemStatus: TranscriptionStatus;
  solutionStatus: TranscriptionStatus;
  nameStatus: TranscriptionStatus;
  setAnonymous: (value: boolean) => void;
  /** Aufnahme uebernehmen und Transkription im Hintergrund starten (blockiert die UI nicht). */
  recordField: (field: Field, blob: Blob) => void;
  /** Text manuell setzen (Tastatur/Korrektur) – verwirft eine evtl. laufende Erkennung des Feldes. */
  setFieldText: (field: Field, text: string) => void;
  /** Feld zuruecksetzen (neu aufnehmen / auf Tastatur wechseln). */
  clearField: (field: Field) => void;
  /** Wartet, bis alle laufenden Transkriptionen fertig sind (fuer "Senden"). */
  awaitTranscriptions: () => Promise<void>;
  reset: () => void;
}

// Modul-lokal: laufende Transkriptionen + Tokens, damit veraltete Ergebnisse
// (nach Neuaufnahme/Tastatur/Reset) nicht den aktuellen Stand ueberschreiben.
const inflight: Partial<Record<Field, Promise<void>>> = {};
const tokens: Record<Field, number> = { problem: 0, solution: 0, name: 0 };

function fieldKeys(field: Field) {
  return {
    blob: `${field}Blob`,
    text: `${field}Text`,
    status: `${field}Status`,
  } as const;
}

export const useComplaintStore = create<ComplaintState>((set) => ({
  isAnonymous: true,
  problemBlob: null,
  solutionBlob: null,
  nameBlob: null,
  problemText: '',
  solutionText: '',
  nameText: '',
  problemStatus: 'idle',
  solutionStatus: 'idle',
  nameStatus: 'idle',

  setAnonymous: (value) => set({ isAnonymous: value }),

  recordField: (field, blob) => {
    const k = fieldKeys(field);
    const token = (tokens[field] += 1);
    set({ [k.blob]: blob, [k.text]: '', [k.status]: 'pending' } as Partial<ComplaintState>);

    const promise = (async () => {
      try {
        const text = await transcribeBlob(blob);
        if (tokens[field] !== token) return; // zwischenzeitlich neu aufgenommen/geloescht
        set({ [k.text]: text, [k.status]: 'done' } as Partial<ComplaintState>);
      } catch {
        if (tokens[field] !== token) return;
        set({ [k.status]: 'error' } as Partial<ComplaintState>);
      } finally {
        if (tokens[field] === token) delete inflight[field];
      }
    })();
    inflight[field] = promise;
  },

  setFieldText: (field, text) => {
    const k = fieldKeys(field);
    tokens[field] += 1; // laufende Erkennung verwerfen
    delete inflight[field];
    set({ [k.text]: text, [k.status]: 'done' } as Partial<ComplaintState>);
  },

  clearField: (field) => {
    const k = fieldKeys(field);
    tokens[field] += 1;
    delete inflight[field];
    set({ [k.blob]: null, [k.text]: '', [k.status]: 'idle' } as Partial<ComplaintState>);
  },

  awaitTranscriptions: async () => {
    await Promise.allSettled(Object.values(inflight));
  },

  reset: () => {
    (['problem', 'solution', 'name'] as Field[]).forEach((f) => {
      tokens[f] += 1;
      delete inflight[f];
    });
    set({
      isAnonymous: true,
      problemBlob: null,
      solutionBlob: null,
      nameBlob: null,
      problemText: '',
      solutionText: '',
      nameText: '',
      problemStatus: 'idle',
      solutionStatus: 'idle',
      nameStatus: 'idle',
    });
  },
}));
