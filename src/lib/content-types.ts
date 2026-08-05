/**
 * The shape the frontend renders. `src/lib/content.ts` maps Payload documents
 * onto these types, so no page or component touches the CMS or its generated
 * types directly — a collection can gain fields without the frontend noticing.
 */

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export type ProjectStatus = 'active' | 'shipped'

/**
 * A resolved upload. Payload returns the whole media document; this is the
 * subset the frontend needs, already narrowed to a usable image (a document
 * still processing has no `url` and is dropped in the mapper).
 */
export type SiteImage = {
  url: string
  alt: string
  width: number
  height: number
}

export type Subsystem = {
  name: string
  summary: string
}

export type Social = {
  /** The one- or two-letter mark the footer renders. */
  label: string
  /** Full name — what a screen reader announces in place of the mark. */
  name: string
  href: string
}

/** Site-wide identity, edited in the Settings global. */
export type SiteSettings = {
  siteName: string
  alternateName?: string
  /** Home page `<title>`; inner pages append the site name via the template. */
  metaTitle: string
  description: string
  email: string
  contactNote?: string
  foundingLocation?: string
  parentOrganization?: string
  /** Raster mark for the Organization JSON-LD; absent falls back to the static asset. */
  organizationLogo?: SiteImage
  socials: Social[]
}

export type Partner = {
  name: string
  logo: SiteImage
  website?: string
  /** Per-logo caps so wordmarks and roundels sit at the same optical weight. */
  maxHeight: number
  maxWidth: number
}

export type PartnerTier = {
  label: string
  /** Plaque min-width differs between the academic row and the rest. */
  minWidth: number
  partners: Partner[]
}

export type MemberLink = {
  /** What the link says, e.g. GitHub. */
  name: string
  href: string
}

export type Member = {
  name: string
  /** Short line under the name — what they work on, not a job title. */
  focus?: string
  /** Absent for anyone who hasn't been photographed; the card shows initials. */
  photo?: SiteImage
  links: MemberLink[]
}

/** A band of the members page. The role is the only label a member carries. */
export type MemberRole = {
  label: string
  blurb?: string
  members: Member[]
}

/**
 * A form as the renderer needs it. The plugin stores fields as blocks with a
 * `blockType` discriminator; this narrows them to the subset enabled in
 * payload.config.ts, so a field the renderer can't draw is a type error rather
 * than a blank space on the page.
 */
export type FormField =
  | {
      blockType: 'checkbox'
      name: string
      label?: string
      required?: boolean
      defaultValue?: boolean
      width?: number
    }
  | {
      blockType: 'email' | 'text' | 'textarea'
      name: string
      label?: string
      required?: boolean
      defaultValue?: string
      width?: number
    }
  | {
      blockType: 'select'
      name: string
      label?: string
      required?: boolean
      defaultValue?: string
      options: { label: string; value: string }[]
      width?: number
    }
  /** Static copy between inputs, not an input — carries no `name`. */
  | { blockType: 'message'; message: DefaultTypedEditorState }

export type ContactForm = {
  id: string
  title: string
  submitButtonLabel: string
  /** Rich text shown in place of the form once it has been submitted. */
  confirmationMessage?: DefaultTypedEditorState
  fields: FormField[]
}

export type Project = {
  slug: string
  title: string
  status: ProjectStatus
  /** Display string for the working cycle, e.g. "2025–2026" or "23–24". */
  cycle: string
  /** Compact cycle for card chrome, e.g. "25–26". */
  cycleShort: string
  /** Competition or milestone this build targets. */
  target?: string
  domain: string
  /** One-paragraph card blurb. */
  excerpt: string
  /** Lead paragraph under the project title. */
  lede: string
  body: string[]
  subsystems: Subsystem[]
  tags: string[]
  /** Caption for the hero slot; also the hatch placeholder text until an image lands. */
  heroCaption: string
  /** Absent until an editor uploads one — the hatch placeholder stands in. */
  heroImage?: SiteImage
}

export type Post = {
  slug: string
  title: string
  category: string
  author: string
  /** ISO date — formatted at render time. */
  publishedAt: string
  readingMinutes: number
  excerpt: string
  heroCaption: string
  heroImage?: SiteImage
  /** Opening paragraph, rendered above the rich text at a larger size. */
  lede: string
  /**
   * Lexical editor state, rendered by `<PostBody>` through converters that map
   * each node onto the article's own type styles.
   */
  content: DefaultTypedEditorState
  tags: string[]
}
