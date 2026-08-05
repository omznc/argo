/**
 * Seeds Payload with the design copy in `src/lib/seed.ts`.
 *
 *   bun run seed             # skips anything already there
 *   bun run seed --force     # deletes the seeded slugs first, then rewrites them
 *   bun run seed --if-empty  # per collection: seed only if it has no documents
 *
 * Idempotent by slug, so it is safe to run against a database that already has
 * content: an existing document is left alone unless --force is passed. It only
 * ever touches slugs it owns, so editor-authored documents are never deleted.
 *
 * `--if-empty` is what the container runs on every boot, and it is not merely a
 * convenience: under Cache Components every `generateStaticParams` must return
 * at least one result, so `next build` fails outright against an empty
 * collection. Guaranteeing one document in each is what makes a deploy against
 * a fresh database possible at all. Once an editor has written anything, the
 * flag makes this a no-op forever.
 */

import config from '@payload-config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BasePayload } from 'payload'
import { getPayload } from 'payload'

import { memberRoles } from '../src/lib/members'
import { partnerTiers } from '../src/lib/partners'
import { posts, projects, type SeedPostBlock } from '../src/lib/seed'
import { fallbackSettings } from '../src/lib/site'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const force = process.argv.includes('--force')
const ifEmpty = process.argv.includes('--if-empty')

/**
 * Lexical's serialised form. The editor writes this shape itself; the seed has
 * to construct it by hand because the copy predates the CMS.
 */
const text = (value: string) => ({
  type: 'text' as const,
  text: value,
  detail: 0,
  format: 0,
  mode: 'normal' as const,
  style: '',
  version: 1,
})

const container = (type: string, value: string, extra: Record<string, unknown> = {}) => ({
  type,
  children: [text(value)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

/**
 * The `lede` block becomes its own field rather than the first paragraph — it
 * is set in a different size and has to stay identifiable after an editor
 * rewrites the body.
 */
function toLexical(blocks: SeedPostBlock[]) {
  const children = blocks
    .filter((block) => block.type !== 'lede')
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return container('heading', block.text, { tag: 'h2' })
        case 'quote':
          return container('quote', block.text)
        default:
          return container('paragraph', block.text, { textFormat: 0, textStyle: '' })
      }
    })

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

const ledeOf = (blocks: SeedPostBlock[]) =>
  blocks.find((block) => block.type === 'lede')?.text ??
  blocks.find((block) => block.type === 'paragraph')?.text ??
  ''

/**
 * The wall as it shipped: a logo upload, a tier and a partner per entry, in
 * that order because each one references the last.
 *
 * Keyed off the partners collection rather than each of the three — a partial
 * run would leave orphan logos, and re-running it would then add a second copy
 * of every file. Emptying `partners` is the signal to build the whole wall again.
 */
async function seedPartners(payload: BasePayload): Promise<void> {
  const { totalDocs } = await payload.count({ collection: 'partners' })

  if (totalDocs > 0 && !force) {
    console.log(`  skip   partners (${totalDocs} already present)`)
    return
  }

  if (force && totalDocs > 0) {
    // Partners first: a tier or a logo still referenced would fail to delete.
    for (const collection of ['partners', 'partner-tiers', 'partner-logos'] as const) {
      const { docs } = await payload.delete({ collection, where: { id: { exists: true } } })
      if (docs.length > 0) console.log(`  removed ${docs.length} existing ${collection}`)
    }
  }

  for (const [tierIndex, tier] of partnerTiers.entries()) {
    const tierDoc = await payload.create({
      collection: 'partner-tiers',
      data: { label: tier.label, order: tierIndex, minWidth: tier.minWidth },
    })

    for (const [partnerIndex, partner] of tier.partners.entries()) {
      const logo = await payload.create({
        collection: 'partner-logos',
        data: {},
        filePath: path.join(repoRoot, 'public/assets/partners', partner.file),
      })

      await payload.create({
        collection: 'partners',
        data: {
          name: partner.name,
          logo: logo.id,
          tier: tierDoc.id,
          order: partnerIndex,
          website: partner.website,
          maxHeight: partner.maxHeight,
          maxWidth: partner.maxWidth,
        },
      })
    }

    console.log(`  create tier ${tier.label} (${tier.partners.length} partners)`)
  }
}

/**
 * The role bands of the members page, and nothing else — see src/lib/members.ts
 * for why no people are seeded. Keyed off the roles collection: once an editor
 * has renamed or reordered a band, a re-run must not put the originals back.
 */
async function seedMemberRoles(payload: BasePayload): Promise<void> {
  const { totalDocs } = await payload.count({ collection: 'member-roles' })

  if (totalDocs > 0 && !force) {
    console.log(`  skip   member roles (${totalDocs} already present)`)
    return
  }

  if (force && totalDocs > 0) {
    // Members first: a role still referenced by one would fail to delete.
    for (const collection of ['members', 'member-roles'] as const) {
      const { docs } = await payload.delete({ collection, where: { id: { exists: true } } })
      if (docs.length > 0) console.log(`  removed ${docs.length} existing ${collection}`)
    }
  }

  for (const [index, role] of memberRoles.entries()) {
    await payload.create({
      collection: 'member-roles',
      data: { label: role.label, blurb: role.blurb, order: index },
    })
    console.log(`  create role ${role.label}`)
  }
}

/**
 * A contact form to start from. Editors can rename the fields, add a select, or
 * point the Settings global at a different form entirely — this only has to be
 * a working one on first boot, so the footer isn't empty.
 */
async function seedContactForm(payload: BasePayload): Promise<number | undefined> {
  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Contact' } },
    depth: 0,
    limit: 1,
  })

  if (existing.docs[0] && !force) {
    console.log('  skip   contact form (already exists)')
    return existing.docs[0].id
  }

  if (force && existing.docs[0]) {
    await payload.delete({ collection: 'forms', id: existing.docs[0].id })
  }

  const form = await payload.create({
    collection: 'forms',
    data: {
      title: 'Contact',
      submitButtonLabel: 'send message',
      confirmationType: 'message',
      confirmationMessage: richText('Thanks — your message is in. We usually reply within a week.'),
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true, width: 100 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 100 },
        {
          blockType: 'select',
          name: 'subject',
          label: 'About',
          required: true,
          width: 100,
          options: [
            { label: 'Sponsorship', value: 'sponsorship' },
            { label: 'Joining the team', value: 'joining' },
            { label: 'Press or a talk', value: 'press' },
            { label: 'Something else', value: 'other' },
          ],
        },
        { blockType: 'textarea', name: 'message', label: 'Message', required: true, width: 100 },
      ],
    },
  })

  console.log('  create contact form')
  return form.id
}

/**
 * Writes the shipped identity copy into the global. Skipped once a name is set,
 * so a re-run never overwrites what an editor has since changed.
 */
async function seedSettings(payload: BasePayload, contactForm?: number): Promise<void> {
  const current = await payload.findGlobal({ slug: 'settings', depth: 0 })

  // `updatedAt` rather than any content field: a global with no row still
  // returns every field's `defaultValue`, so checking `siteName` would report
  // an unwritten global as already configured and skip it forever.
  if (current?.updatedAt && !force) {
    console.log('  skip   settings (already configured)')
    return
  }

  await payload.updateGlobal({
    slug: 'settings',
    data: { ...fallbackSettings, organizationLogo: undefined, contactForm },
  })

  console.log('  create settings')
}

/** The minimal Lexical document a rich text field will accept. */
function richText(value: string) {
  return {
    root: {
      type: 'root',
      children: [container('paragraph', value, { textFormat: 0, textStyle: '' })],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

async function main() {
  const payload = await getPayload({ config })

  for (const collection of ['projects', 'posts'] as const) {
    const slugs = (collection === 'projects' ? projects : posts).map((doc) => doc.slug)

    // Checked per collection rather than across both: a build needs at least
    // one project *and* one post, so a site with projects but no journal entry
    // still has to have the journal seeded.
    if (ifEmpty) {
      const { totalDocs } = await payload.count({ collection })
      if (totalDocs > 0) {
        console.log(`  skip   ${collection} (${totalDocs} already present)`)
        continue
      }
    }

    if (force) {
      const { docs } = await payload.delete({
        collection,
        where: { slug: { in: slugs } },
      })
      if (docs.length > 0) console.log(`  removed ${docs.length} existing ${collection}`)
    }

    const { docs: existing } = await payload.find({
      collection,
      where: { slug: { in: slugs } },
      depth: 0,
      pagination: false,
      select: { slug: true },
    })
    const present = new Set(existing.map((doc) => doc.slug))

    if (collection === 'projects') {
      for (const project of projects) {
        if (present.has(project.slug)) {
          console.log(`  skip   project ${project.slug} (already exists)`)
          continue
        }
        await payload.create({
          collection: 'projects',
          data: {
            ...project,
            body: project.body.map((value) => ({ text: value })),
            tags: project.tags.map((tag) => ({ tag })),
            _status: 'published',
          },
        })
        console.log(`  create project ${project.slug}`)
      }
    } else {
      for (const post of posts) {
        if (present.has(post.slug)) {
          console.log(`  skip   post ${post.slug} (already exists)`)
          continue
        }
        await payload.create({
          collection: 'posts',
          data: {
            slug: post.slug,
            title: post.title,
            category: post.category,
            author: post.author,
            publishedAt: new Date(post.publishedAt).toISOString(),
            excerpt: post.excerpt,
            heroCaption: post.heroCaption,
            lede: ledeOf(post.body),
            content: toLexical(post.body),
            tags: post.tags.map((tag) => ({ tag })),
            _status: 'published',
          },
        })
        console.log(`  create post ${post.slug}`)
      }
    }
  }

  await seedPartners(payload)
  await seedMemberRoles(payload)
  const formId = await seedContactForm(payload)
  await seedSettings(payload, formId)

  const { totalDocs: users } = await payload.count({ collection: 'users' })
  if (users === 0) {
    console.log(
      '\nNo admin user yet — open http://localhost:3000/admin and the first visit will create one.',
    )
  }

  console.log('\nSeed complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
