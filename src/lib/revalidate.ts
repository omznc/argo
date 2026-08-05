import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalConfig,
} from 'payload'

/**
 * Bridges Payload's write path to the Next cache.
 *
 * The content accessors in src/lib/content.ts are cached with `cacheLife('max')`,
 * so nothing expires on a schedule — pages stay prerendered until something
 * actually changes. These hooks are what "actually changes" means: publishing,
 * updating or deleting a document expires that collection's tag, and the next
 * request rebuilds the affected pages.
 *
 * `revalidateTag` is imported lazily because this module is reachable from
 * payload.config.ts, which the Payload CLI also loads outside a Next server
 * (migrations, generate:types). There is nothing to revalidate there.
 */
async function expire(tags: string[]) {
  try {
    const { revalidateTag } = await import('next/cache')
    // Under Cache Components revalidateTag takes a cache profile and expires the
    // tag with stale-while-revalidate semantics, so readers are never blocked.
    for (const tag of tags) revalidateTag(tag, 'max')
  } catch {
    // Not running inside a Next.js server — the Payload CLI, for instance.
  }
}

/**
 * Returns the `hooks` block for a collection whose documents back cached pages.
 * `tag` is the collection-wide tag; each document also expires its own
 * `tag:slug` so a single edit doesn't invalidate every sibling.
 */
export function revalidateHooks(tag: string): CollectionConfig['hooks'] {
  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
    const slugs = [doc?.slug, previousDoc?.slug].filter(
      (value): value is string => typeof value === 'string',
    )
    await expire([tag, ...new Set(slugs.map((slug) => `${tag}:${slug}`))])
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await expire(typeof doc?.slug === 'string' ? [tag, `${tag}:${doc.slug}`] : [tag])
    return doc
  }

  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}

/**
 * The same bridge for a collection whose documents have no slug of their own —
 * partners and tiers render as one wall, so any write expires the whole tag.
 */
export function revalidateFlatHooks(tag: string): CollectionConfig['hooks'] {
  return {
    afterChange: [
      async ({ doc }) => {
        await expire([tag])
        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await expire([tag])
        return doc
      },
    ],
  }
}

/**
 * And for a global. There is one document, so there is one tag — but it is
 * read by nearly every page (the footer and the JSON-LD are site-wide), which
 * makes a settings edit the one write that legitimately rebuilds everything.
 */
export function revalidateGlobalHooks(tag: string): GlobalConfig['hooks'] {
  return {
    afterChange: [
      async ({ doc }) => {
        await expire([tag])
        return doc
      },
    ],
  }
}
