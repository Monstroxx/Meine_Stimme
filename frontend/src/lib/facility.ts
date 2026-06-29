import { useParams } from 'react-router-dom';

const STORAGE_KEY = 'meine-stimme:facility-slug';

/**
 * Liest den Einrichtungs-Slug frisch aus der URL (z. B. /wohnform-03/problem -> "wohnform-03").
 * Kiosk-Browser leeren Cookies/Cache beim Neustart, deshalb ist die Start-URL die einzige
 * verlässliche Quelle (siehe docs/Beschwerde-App Brainstorming.md, Abschnitt 4).
 * localStorage dient nur als Komfort-Fallback, falls die URL ausnahmsweise keinen Slug enthält.
 */
export function getFacilitySlug(pathname: string = window.location.pathname): string | null {
  const segment = pathname.split('/').filter(Boolean)[0];

  if (segment && segment !== 'admin') {
    window.localStorage.setItem(STORAGE_KEY, segment);
    return segment;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

/**
 * React-Router liefert den Slug aus dem URL-Match, kann ihn aber nicht aus localStorage
 * nachladen. getFacilitySlug() ist daher die massgebliche Quelle; useParams() dient hier
 * nur als Hinweis, dass sich die Route geaendert hat, damit der Hook bei Navigation neu liest.
 */
export function useFacilitySlug(): string | null {
  const { facilitySlug: paramSlug } = useParams();
  return getFacilitySlug() ?? paramSlug ?? null;
}
