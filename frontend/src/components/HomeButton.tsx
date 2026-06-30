import { House } from 'lucide-react';

interface HomeButtonProps {
  onClick: () => void;
}

/** Graue runde Home-Schaltflaeche oben links (docs/ui_konzept). */
export function HomeButton({ onClick }: HomeButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Zurück zum Start"
      className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-700 active:bg-gray-200"
    >
      <House size={26} strokeWidth={2.5} />
    </button>
  );
}
