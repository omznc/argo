import 'server-only'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { cacheLife, cacheTag } from 'next/cache'

import { TIER_SCALES } from '@/collections/PartnerTiers'
import type {
  Form,
  Media,
  MemberPhoto,
  PartnerLogo,
  Post as PostDoc,
  Project as ProjectDoc,
  Setting,
} from '@/payload-types'

import {
  FORMS_TAG,
  MEMBERS_TAG,
  PARTNERS_TAG,
  POSTS_TAG,
  PROJECTS_TAG,
  SETTINGS_TAG,
} from './cache-tags'
import type {
  ContactForm,
  FormField,
  Member,
  MemberRole,
  Partner,
  PartnerTier,
  Post,
  Project,
  ProjectStatus,
  SiteImage,
  SiteSettings,
} from './content-types'
import { payloadClient } from './payload'
import { estimateReadingMinutes } from './reading-time'
import { fallbackSettings } from './site'

/**
 * The single seam between the site and its content source.
 *
 * Every accessor reads Payload through the Local API and maps the document onto
 * the frontend types in content-types.ts, so pages never see a CMS shape and a
 * collection can gain fields without a component changing.
 *
 * Every accessor is `use cache`. Under Cache Components nothing is cached
 * implicitly, and only cached reads can be prerendered into a route's App Shell,
 * so this directive is what keeps the site static — the database is read at
 * build and on revalidation, never on a request.
 *
 * `cacheLife('max')` then says the content never goes stale on a timer — which
 * is true, because a CMS knows exactly when its content changed. The `cacheTag`
 * calls are the other half: the Payload hooks in src/lib/revalidate.ts expire
 * these tags on publish, so a page is rebuilt when an editor changes it and
 * never merely because time passed.
 */

/**
 * Drafts are enabled on both collections, so an unpublished document sits in
 * the same table as a live one. Every read is filtered on this — without it,
 * saving a draft would publish it.
 */
const published = { _status: { equals: 'published' } }

/** Arrays are optional on every generated Payload type; the frontend wants a list. */
const list = <T,>(value: T[] | null | undefined): T[] => value ?? []

/**
 * Payload returns either the populated document or just its id, depending on
 * `depth`. An upload still processing has no `url` or dimensions, which would
 * render as a broken box — treated as "no image" so the hatch placeholder keeps
 * standing in.
 */
function toImage(value: Media | number | null | undefined): SiteImage | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const { url, alt, width, height } = value
  if (!url || !width || !height) return undefined
  return { url, alt: alt ?? '', width, height }
}

/**
 * The same narrowing for the uploads that carry no `alt` of their own — a
 * partner logo and a member photo are both described by the name on the
 * document above them, which is required there. Asking for the alt text twice
 * is asking for it to drift, so it is passed in.
 */
function toUpload(
  value: MemberPhoto | PartnerLogo | number | null | undefined,
  alt: string,
): SiteImage | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const { url, width, height } = value
  if (!url || !width || !height) return undefined
  return { url, alt, width, height }
}

/** A relationship arrives as the populated document or its id, depending on depth. */
function relationId(value: { id: number } | number | null | undefined): number | undefined {
  if (typeof value === 'number') return value
  return value?.id
}

/**
 * Narrows the plugin's field blocks to the ones the renderer draws. A block
 * type that isn't handled is dropped rather than rendered blank — the config
 * disables every field this doesn't cover, so reaching the default means the
 * two have drifted, and a missing input is a better failure than a form that
 * silently posts an incomplete payload.
 */
function toFormField(block: NonNullable<Form['fields']>[number]): FormField | null {
  switch (block.blockType) {
    case 'checkbox':
      return {
        blockType: 'checkbox',
        name: block.name,
        label: block.label ?? undefined,
        required: block.required ?? false,
        defaultValue: block.defaultValue ?? false,
        width: block.width ?? undefined,
      }
    // The email block is the odd one out: the plugin gives it no defaultValue.
    case 'email':
      return {
        blockType: 'email',
        name: block.name,
        label: block.label ?? undefined,
        required: block.required ?? false,
        width: block.width ?? undefined,
      }
    case 'text':
    case 'textarea':
      return {
        blockType: block.blockType,
        name: block.name,
        label: block.label ?? undefined,
        required: block.required ?? false,
        defaultValue: block.defaultValue ?? undefined,
        width: block.width ?? undefined,
      }
    case 'select':
      return {
        blockType: 'select',
        name: block.name,
        label: block.label ?? undefined,
        required: block.required ?? false,
        defaultValue: block.defaultValue ?? undefined,
        options: list(block.options).map((option) => ({
          label: option.label,
          value: option.value,
        })),
        width: block.width ?? undefined,
      }
    case 'message':
      return { blockType: 'message', message: block.message as DefaultTypedEditorState }
    default:
      return null
  }
}

function toContactForm(doc: Form): ContactForm {
  return {
    id: String(doc.id),
    title: doc.title,
    submitButtonLabel: doc.submitButtonLabel || 'Send',
    confirmationMessage: doc.confirmationMessage ?? undefined,
    fields: list(doc.fields)
      .map(toFormField)
      .filter((field): field is FormField => field !== null),
  }
}

function toProject(doc: ProjectDoc): Project {
  return {
    slug: doc.slug,
    title: doc.title,
    status: doc.status as ProjectStatus,
    cycle: doc.cycle,
    cycleShort: doc.cycleShort,
    target: doc.target ?? undefined,
    domain: doc.domain,
    excerpt: doc.excerpt,
    lede: doc.lede,
    body: list(doc.body).map((row) => row.text),
    subsystems: list(doc.subsystems).map((row) => ({ name: row.name, summary: row.summary })),
    tags: list(doc.tags).map((row) => row.tag),
    heroCaption: doc.heroCaption ?? '',
    heroImage: toImage(doc.heroImage),
  }
}

function toPost(doc: PostDoc): Post {
  return {
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    author: doc.author,
    publishedAt: doc.publishedAt,
    // The field hook fills this on every save, so it is only absent on a row
    // written before the estimate existed — computed here rather than defaulted
    // to a number, so an old post doesn't claim to be a one-minute read.
    readingMinutes: doc.readingMinutes ?? estimateReadingMinutes(doc.lede, doc.content),
    excerpt: doc.excerpt,
    lede: doc.lede,
    content: doc.content,
    tags: list(doc.tags).map((row) => row.tag),
    heroCaption: doc.heroCaption ?? '',
    heroImage: toImage(doc.heroImage),
  }
}

/**
 * `depth: 1` resolves the heroImage upload to its media document and stops
 * there — deeper would start pulling relationships nothing renders.
 *
 * `pagination: false` because these collections are one team's project list and
 * journal, not a feed. If either outgrows a single page that is the line to
 * revisit, rather than letting Payload's default limit of 10 truncate silently.
 */
async function findProjects(where: Record<string, unknown> = {}): Promise<Project[]> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: { ...published, ...where },
    // Newest cycle first — "2025–2026" style values sort correctly as strings.
    sort: '-cycle',
    depth: 1,
    pagination: false,
  })
  return docs.map(toProject)
}

export async function getProjects(): Promise<Project[]> {
  'use cache'
  cacheLife('max')
  cacheTag(PROJECTS_TAG)
  return findProjects()
}

export async function getActiveProjects(): Promise<Project[]> {
  'use cache'
  cacheLife('max')
  cacheTag(PROJECTS_TAG)
  return findProjects({ status: { equals: 'active' } })
}

export async function getShippedProjects(): Promise<Project[]> {
  'use cache'
  cacheLife('max')
  cacheTag(PROJECTS_TAG)
  return findProjects({ status: { equals: 'shipped' } })
}

export async function getProject(slug: string): Promise<Project | null> {
  'use cache'
  cacheLife('max')
  // Tagged both ways so an editor saving one project doesn't rebuild the rest.
  cacheTag(PROJECTS_TAG, `${PROJECTS_TAG}:${slug}`)

  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: { ...published, slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ? toProject(docs[0]) : null
}

/**
 * The "next project" link at the foot of a project page. Wraps around so the
 * last project points back at the first.
 */
export async function getNextProject(slug: string): Promise<Project | null> {
  'use cache'
  cacheLife('max')
  cacheTag(PROJECTS_TAG)

  const projects = await findProjects()
  const index = projects.findIndex((p) => p.slug === slug)
  if (index === -1) return null
  return projects[(index + 1) % projects.length] ?? null
}

export async function getPosts(): Promise<Post[]> {
  'use cache'
  cacheLife('max')
  cacheTag(POSTS_TAG)

  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: published,
    sort: '-publishedAt',
    depth: 1,
    pagination: false,
  })
  return docs.map(toPost)
}

export async function getPost(slug: string): Promise<Post | null> {
  'use cache'
  cacheLife('max')
  cacheTag(POSTS_TAG, `${POSTS_TAG}:${slug}`)

  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { ...published, slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ? toPost(docs[0]) : null
}

/**
 * Site identity. The global has no row at all until something writes it, and
 * every field would then read as undefined — on a page whose `<title>` and
 * JSON-LD depend on it. So each value falls back to the shipped copy in
 * site.ts, which is also what the seed writes into the global. One authored
 * source, used twice: as the seed and as the floor.
 */
export async function getSettings(): Promise<SiteSettings> {
  'use cache'
  cacheLife('max')
  cacheTag(SETTINGS_TAG)

  const payload = await payloadClient()
  const doc = (await payload.findGlobal({ slug: 'settings', depth: 1 })) as Partial<Setting>

  const socials = list(doc.socials).map((row) => ({
    label: row.label,
    name: row.name,
    href: row.href,
  }))

  return {
    siteName: doc.siteName || fallbackSettings.siteName,
    alternateName: doc.alternateName ?? fallbackSettings.alternateName,
    metaTitle: doc.metaTitle || fallbackSettings.metaTitle,
    description: doc.description || fallbackSettings.description,
    email: doc.email || fallbackSettings.email,
    contactNote: doc.contactNote ?? fallbackSettings.contactNote,
    foundingLocation: doc.foundingLocation ?? fallbackSettings.foundingLocation,
    parentOrganization: doc.parentOrganization ?? fallbackSettings.parentOrganization,
    organizationLogo: toImage(doc.organizationLogo),
    socials: socials.length > 0 ? socials : fallbackSettings.socials,
  }
}

/**
 * The partner wall, already grouped into its rows.
 *
 * Two reads rather than one per tier, then grouped in memory — the whole wall
 * is a few dozen rows, and a query per tier would scale with the sponsor list
 * for no benefit. Tiers with no partners are dropped: an empty row renders as a
 * label floating beside nothing.
 */
export async function getPartnerTiers(): Promise<PartnerTier[]> {
  'use cache'
  cacheLife('max')
  cacheTag(PARTNERS_TAG)

  const payload = await payloadClient()
  const [tiers, partners] = await Promise.all([
    payload.find({ collection: 'partner-tiers', sort: '_order', depth: 0, pagination: false }),
    payload.find({
      collection: 'partners',
      // A lapsed sponsorship falls off the wall on its own. `exists: false`
      // keeps the open-ended ones — most partners never get an end date.
      where: {
        or: [
          { activeUntil: { exists: false } },
          { activeUntil: { greater_than: new Date().toISOString() } },
        ],
      },
      sort: '_order',
      depth: 1,
      pagination: false,
    }),
  ])

  const toPartner = (doc: (typeof partners.docs)[number]): Partner | null => {
    const logo = toUpload(doc.logo, doc.name)
    if (!logo) return null
    return {
      name: doc.name,
      logo,
      website: doc.website ?? undefined,
      maxHeight: doc.maxHeight,
      maxWidth: doc.maxWidth,
    }
  }

  return tiers.docs
    .map((tier) => ({
      label: tier.label,
      minWidth: tier.minWidth,
      // Resolved here rather than in the component: the wall renders numbers,
      // and the key -> multiplier table is the collection's business.
      scale: TIER_SCALES[tier.logoScale] ?? TIER_SCALES.default,
      partners: partners.docs
        .filter((partner) => relationId(partner.tier) === tier.id)
        .map(toPartner)
        .filter((partner): partner is Partner => partner !== null),
    }))
    .filter((tier) => tier.partners.length > 0)
}

/**
 * The members page, already grouped into its bands.
 *
 * Same shape as the partner wall above, and for the same reasons: two reads
 * rather than one per role, grouped in memory, with empty roles dropped — a
 * role heading standing over nothing reads as a page that failed to load.
 *
 * Unlike a partner, a member survives a missing upload: `photo` is optional and
 * the card falls back to an initials monogram, so nobody is dropped from the
 * team page for want of a headshot.
 */
export async function getMemberRoles(): Promise<MemberRole[]> {
  'use cache'
  cacheLife('max')
  cacheTag(MEMBERS_TAG)

  const payload = await payloadClient()
  const [roles, members] = await Promise.all([
    payload.find({ collection: 'member-roles', sort: 'order', depth: 0, pagination: false }),
    payload.find({ collection: 'members', sort: 'order', depth: 1, pagination: false }),
  ])

  const toMember = (doc: (typeof members.docs)[number]): Member => ({
    name: doc.name,
    focus: doc.focus ?? undefined,
    photo: toUpload(doc.photo, doc.name),
    links: list(doc.links).map((row) => ({ name: row.name, href: row.href })),
  })

  return roles.docs
    .map((role) => ({
      label: role.label,
      blurb: role.blurb ?? undefined,
      members: members.docs.filter((member) => relationId(member.role) === role.id).map(toMember),
    }))
    .filter((role) => role.members.length > 0)
}

/**
 * The form the contact section renders, chosen in the Settings global. Tagged
 * on both settings and forms, because either changing changes what renders:
 * pointing at a different form, or editing the fields of the current one.
 */
export async function getContactForm(): Promise<ContactForm | null> {
  'use cache'
  cacheLife('max')
  cacheTag(SETTINGS_TAG, FORMS_TAG)

  const payload = await payloadClient()
  const settings = (await payload.findGlobal({ slug: 'settings', depth: 1 })) as Partial<Setting>
  const form = settings.contactForm
  if (typeof form !== 'object' || form === null) return null

  return toContactForm(form)
}

/** Counts for the "3 active · 4 shipped" line on the home page. */
export async function getProjectCounts(): Promise<{ active: number; shipped: number }> {
  'use cache'
  cacheLife('max')
  cacheTag(PROJECTS_TAG)

  const payload = await payloadClient()
  const count = async (status: ProjectStatus) => {
    const { totalDocs } = await payload.count({
      collection: 'projects',
      where: { ...published, status: { equals: status } },
    })
    return totalDocs
  }

  const [active, shipped] = await Promise.all([count('active'), count('shipped')])
  return { active, shipped }
}

/**
 * `updatedAt` per slug, for the sitemap's `lastModified`. Kept here rather than
 * on the frontend types because no page renders it.
 */
export async function getContentLastModified(): Promise<{
  projects: Record<string, string>
  posts: Record<string, string>
}> {
  'use cache'
  cacheLife('max')
  cacheTag(PROJECTS_TAG, POSTS_TAG)

  const payload = await payloadClient()
  const [projects, posts] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: published,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'posts',
      where: published,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
  ])

  const index = (docs: { slug?: string | null; updatedAt?: string | null }[]) =>
    Object.fromEntries(
      docs.flatMap((doc) => (doc.slug && doc.updatedAt ? [[doc.slug, doc.updatedAt]] : [])),
    )

  return { projects: index(projects.docs), posts: index(posts.docs) }
}
