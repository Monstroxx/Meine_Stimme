import { Check, Mic, Square } from 'lucide-react';

type MicState = 'idle' | 'recording' | 'done';

interface MicButtonProps {
  state: MicState;
  onClick: () => void;
  size?: 'lg' | 'md';
  label?: string;
}

const sizes = {
  lg: { ring: 'h-64 w-64 p-4', icon: 92 },
  md: { ring: 'h-52 w-52 p-3', icon: 76 },
};

/**
 * Grosser roter Mikrofon-Knopf mit hellem Ring (docs/ui_konzept).
 * Wechselt zwischen Aufnehmen / Stopp / Fertig.
 */
export function MicButton({ state, onClick, size = 'md', label }: MicButtonProps) {
  const s = sizes[size];

  const ringColor =
    state === 'done' ? 'bg-green-100' : 'bg-brand-mic-ring';
  const coreColor =
    state === 'done' ? 'bg-brand-green' : 'bg-brand-mic';
  const Icon = state === 'recording' ? Square : state === 'done' ? Check : Mic;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onClick}
        aria-label={state === 'recording' ? 'Aufnahme stoppen' : state === 'done' ? 'Neu aufnehmen' : 'Aufnehmen'}
        className={`flex items-center justify-center rounded-full ${ringColor} ${
          state === 'recording' ? 'animate-mic-pulse' : ''
        }`}
      >
        <span className={`flex ${s.ring} items-center justify-center rounded-full ${coreColor} text-white`}>
          <Icon size={s.icon} strokeWidth={state === 'recording' ? 0 : 2} fill={state === 'recording' ? 'currentColor' : 'none'} />
        </span>
      </button>
      {label && <span className="text-3xl font-extrabold text-gray-900">{label}</span>}
    </div>
  );
}
