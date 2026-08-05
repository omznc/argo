import { getSettings } from '@/lib/content'
import type { MemberRole, Post, Project } from '@/lib/content-types'
import { absoluteUrl, siteUrl } from '@/lib/site'

/**
 * JSON-LD. Google reads this to build rich results — the organisation panel for
 * the team, article cards for journal posts. It renders inside the prerendered
 * shell, so it costs nothing at request time.
 *
 * The payload is serialised with JSON.stringify rather than interpolated, so
 * editor-supplied text can't break out of the script tag.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

/**
 * Stable node identity for the organisation. Every other graph on the site
 * points its publisher/creator at this `@id` rather than repeating the details,
 * so a search engine reads one organisation, not one per page.
 */
const organizationId = `${siteUrl}#organization`

/** The publisher/creator reference the per-page graphs share. */
const organizationRef = { '@id': organizationId }

export async function OrganizationJsonLd() {
  const settings = await getSettings()

  // Google's logo guidelines don't accept SVG, so this wants a raster mark —
  // the shipped one is the artwork flattened onto the site's ink background,
  // because JPEG has no transparency to render white on. An editor can replace
  // it from the Settings global.
  const logo = settings.organizationLogo ?? {
    url: '/assets/argo-mark.jpg',
    width: 600,
    height: 420,
  }

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': organizationId,
        name: settings.siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl(logo.url),
          width: logo.width,
          height: logo.height,
        },
        description: settings.description,
        email: settings.email,
        // How a search engine ties the team's profiles to this domain.
        sameAs: settings.socials.map((social) => social.href),
        // Each of these is dropped rather than emitted empty — a null field is
        // a worse signal to a crawler than an absent one.
        ...(settings.alternateName && { alternateName: settings.alternateName }),
        ...(settings.foundingLocation && {
          foundingLocation: { '@type': 'Place', name: settings.foundingLocation },
        }),
        ...(settings.parentOrganization && {
          parentOrganization: {
            '@type': 'CollegeOrUniversity',
            name: settings.parentOrganization,
          },
        }),
      }}
    />
  )
}

/**
 * The site itself. Emitted once, on the home page — a second copy on every
 * route would just be the same node repeated. No `SearchAction`: the site has
 * no search endpoint, and claiming one Google can't hit is worse than omitting it.
 */
export async function WebSiteJsonLd() {
  const settings = await getSettings()

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        name: settings.siteName,
        url: siteUrl,
        description: settings.description,
        inLanguage: 'en',
        publisher: organizationRef,
        ...(settings.alternateName && { alternateName: settings.alternateName }),
      }}
    />
  )
}

/**
 * Trail for a detail page. The crumbs mirror the on-page path line above the
 * title, so what a crawler reads and what a reader sees can't drift.
 */
export function BreadcrumbJsonLd({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.path),
        })),
      }}
    />
  )
}

/**
 * A listing page and the entries on it. The `ItemList` carries URLs only —
 * each entry's own page already publishes its full description, and repeating
 * it here would mean two sources for the same fact.
 */
function CollectionJsonLd({
  name,
  description,
  path,
  type = 'CollectionPage',
  items,
}: {
  name: string
  description: string
  path: string
  type?: 'CollectionPage' | 'Blog'
  items: { name: string; path: string }[]
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': type,
        name,
        description,
        url: absoluteUrl(path),
        isPartOf: { '@id': `${siteUrl}#website` },
        publisher: organizationRef,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: absoluteUrl(item.path),
          })),
        },
      }}
    />
  )
}

export function ProjectListJsonLd({ projects }: { projects: Project[] }) {
  return (
    <CollectionJsonLd
      name="Projects"
      description="Rovers, rockets and avionics built by the Argo student laboratory at the University of Belgrade."
      path="/projects"
      items={projects.map((project) => ({
        name: project.title,
        path: `/projects/${project.slug}`,
      }))}
    />
  )
}

export function PostListJsonLd({ posts }: { posts: Post[] }) {
  return (
    <CollectionJsonLd
      name="Journal"
      description="Engineering notes and team writing from the Argo student laboratory."
      path="/journal"
      type="Blog"
      items={posts.map((post) => ({ name: post.title, path: `/journal/${post.slug}` }))}
    />
  )
}

/**
 * The members page. Written by hand rather than through `CollectionJsonLd`,
 * because that emits an `ItemList` of URLs and a member has no page of their
 * own — the entries here are `Person` nodes, each tied back to the organisation
 * so a crawler reads them as the team rather than as unrelated people.
 *
 * No `image`, `sameAs` or contact details: this is a public page listing
 * students, and the less of their personal data is machine-collectable from
 * structured markup, the better. The names and roles are the page's point; the
 * rest is not.
 */
export function MemberListJsonLd({ roles }: { roles: MemberRole[] }) {
  const people = roles.flatMap((role) =>
    role.members.map((member) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: role.label,
      affiliation: organizationRef,
    })),
  )

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Members',
        description: 'The students who build what the Argo laboratory ships.',
        url: absoluteUrl('/members'),
        isPartOf: { '@id': `${siteUrl}#website` },
        publisher: organizationRef,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: people.length,
          itemListElement: people.map((person, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: person,
          })),
        },
      }}
    />
  )
}

export async function ProjectJsonLd({ project }: { project: Project }) {
  const { siteName } = await getSettings()
  const url = absoluteUrl(`/projects/${project.slug}`)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.excerpt,
          url,
          keywords: project.tags.join(', '),
          creator: organizationRef,
          isPartOf: { '@id': `${siteUrl}#website` },
          // Hero uploads are optional, so the key is dropped rather than emitted
          // as null — a null image is a worse signal than no image at all.
          ...(project.heroImage && { image: absoluteUrl(project.heroImage.url) }),
          // Each subsystem is a named part of the build, not free text.
          ...(project.subsystems.length > 0 && {
            hasPart: project.subsystems.map((subsystem) => ({
              '@type': 'CreativeWork',
              name: subsystem.name,
              description: subsystem.summary,
            })),
          }),
        }}
      />
      <BreadcrumbJsonLd
        trail={[
          { name: siteName, path: '/' },
          { name: 'Projects', path: '/projects' },
          { name: project.title, path: `/projects/${project.slug}` },
        ]}
      />
    </>
  )
}

export async function PostJsonLd({ post }: { post: Post }) {
  const { siteName } = await getSettings()
  const url = absoluteUrl(`/journal/${post.slug}`)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          url,
          datePublished: post.publishedAt,
          articleSection: post.category,
          keywords: post.tags.join(', '),
          author: { '@type': 'Person', name: post.author },
          publisher: organizationRef,
          isPartOf: { '@id': `${siteUrl}#website` },
          mainEntityOfPage: url,
          // ISO 8601 duration — the same estimate the byline shows.
          timeRequired: `PT${post.readingMinutes}M`,
          ...(post.heroImage && { image: absoluteUrl(post.heroImage.url) }),
        }}
      />
      <BreadcrumbJsonLd
        trail={[
          { name: siteName, path: '/' },
          { name: 'Journal', path: '/journal' },
          { name: post.title, path: `/journal/${post.slug}` },
        ]}
      />
    </>
  )
}
