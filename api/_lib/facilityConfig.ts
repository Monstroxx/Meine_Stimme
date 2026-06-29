// Slug -> Anzeigename fuer den E-Mail-Betreff. Server-only, da nur fuer den Mailversand relevant.
// Anpassen, sobald die echten Einrichtungs-Slugs feststehen (siehe Umsetzungsplan Abschnitt 8).
const FACILITY_NAMES: Record<string, string> = {
  'wohnform-01': 'Wohnform 1',
  'wohnform-02': 'Wohnform 2',
  'wohnform-03': 'Wohnform 3',
};

const FACILITY_SLUG_PATTERN = /^[a-z0-9-]{1,40}$/;

export function isValidFacilitySlug(slug: string): boolean {
  return FACILITY_SLUG_PATTERN.test(slug);
}

export function getFacilityName(slug: string): string {
  return FACILITY_NAMES[slug] ?? slug;
}
