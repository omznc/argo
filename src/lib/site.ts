import type { SiteSettings } from './content-types'

/**
 * Canonical origin for the site. Everything that has to emit an absolute URL —
 * metadataBase, canonicals, sitemap, robots, OG images — reads it from here, so
 * a domain change is one edit and a preview deploy can override it.
 *
 * Deliberately not in the Settings global: this is a property of the
 * deployment, not the content. A preview build has to override it per
 * environment, and an editor able to point every canonical at another host
 * would be one save away from de-indexing the site.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://argorobotics.rs'

/**
 * The shipped identity copy, used twice: `scripts/seed.ts` writes it into the
 * Settings global on first boot, and `getSettings()` falls back to it field by
 * field. A global has no row until something writes one, and every page's
 * `<title>` and JSON-LD read from it — so this is the floor that keeps an
 * unseeded database from rendering a nameless site.
 *
 * Once an editor saves the global their values win; this stays as the default.
 */
export const fallbackSettings: SiteSettings = {
  siteName: 'Argo',
  alternateName: 'Argo Student Space Research Laboratory',
  metaTitle: 'Argo — Student Space Research Laboratory',
  description:
    'Argo is a student team from the University of Belgrade designing autonomous rovers and experimental rockets.',
  email: 'contact@argorobotics.rs',
  contactNote: 'Collaborate · sponsor · invite us for a talk.',
  foundingLocation: 'Belgrade, Serbia',
  parentOrganization: 'University of Belgrade',
  /**
   * One list, two readers: the footer renders the labels, and the Organization
   * JSON-LD emits the URLs as `sameAs` — which is how a search engine ties these
   * profiles to the site and builds the knowledge panel. Kept together so adding
   * a profile can't update the footer and silently miss the structured data.
   */
  socials: [
    { label: 'IG', name: 'Instagram', href: 'https://instagram.com/argorobotics' },
    { label: 'IN', name: 'LinkedIn', href: 'https://linkedin.com/company/argorobotics' },
    { label: 'YT', name: 'YouTube', href: 'https://youtube.com/@argorobotics' },
    { label: 'X', name: 'X', href: 'https://x.com/argorobotics' },
    { label: 'FB', name: 'Facebook', href: 'https://facebook.com/argorobotics' },
  ],
}

/** Absolute URL for a path, for canonicals and structured data. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString()
}
