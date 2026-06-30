import type { ReactNode } from 'react';
import { HomeButton } from './HomeButton';
import { ProgressDots } from './ProgressDots';

interface KioskFrameProps {
  /** Home-Button oben links anzeigen (Standard: an). */
  onHome?: () => void;
  /** Element oben rechts (z. B. Vorlese-Button auf Start/Senden/Fertig). */
  topRight?: ReactNode;
  /** Fester Fussbereich (grosse Aktions-Buttons). */
  footer?: ReactNode;
  /** Fortschrittspunkte unter dem Footer. */
  dots?: { step: number; total: number };
  children: ReactNode;
}

/**
 * Einheitliches Bildschirm-Geruest fuer die Bewohner-Ansicht (docs/ui_konzept):
 * Kopfzeile mit Home links, Inhalt zentriert, Aktions-Buttons + Fortschritt unten.
 * Schmale, tablet-taugliche Spaltenbreite, viel Weissraum.
 */
export function KioskFrame({ onHome, topRight, footer, dots, children }: KioskFrameProps) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pb-8 pt-6">
      <header className="flex min-h-14 items-start justify-between">
        {onHome ? <HomeButton onClick={onHome} /> : <span className="h-14 w-14" />}
        {topRight ?? <span className="h-14 w-14" />}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
        {children}
      </main>

      {footer && <div className="flex w-full flex-col gap-4">{footer}</div>}
      {dots && <ProgressDots step={dots.step} total={dots.total} />}
    </div>
  );
}
