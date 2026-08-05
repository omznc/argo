import type { MetadataRoute } from 'next'

import { getContentLastModified, getPosts, getProjects } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'

/**
 * Built from the same cached accessors the pages use, so it is prerendered
 * alongside them and expires on the same Payload tags — publish a project and
 * the sitemap is rebuilt with it.
 *
 * `lastModified` comes from each document's `updatedAt` rather than its
 * publication date: a crawler wants to know when the page last changed, and a
 * post edited a year after publication is still a change.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, modified] = await Promise.all([
    getProjects(),
    getPosts(),
    getContentLastModified(),
  ])

  const date = (value?: string) => (value ? new Date(value) : undefined)

  return [
    { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/projects'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/journal'), changeFrequency: 'weekly', priority: 0.8 },
    // Turns over once a cycle as students join and graduate.
    { url: absoluteUrl('/members'), changeFrequency: 'yearly', priority: 0.6 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.5 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: date(modified.projects[project.slug]),
      changeFrequency: 'monthly' as const,
      priority: project.status === 'active' ? 0.7 : 0.5,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/journal/${post.slug}`),
      lastModified: date(modified.posts[post.slug]) ?? new Date(post.publishedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
