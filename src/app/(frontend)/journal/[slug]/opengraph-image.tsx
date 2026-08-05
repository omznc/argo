import { ogCard, ogContentType, ogSize } from '@/lib/og'
import { getPost, getPosts } from '@/lib/content'
import { formatPostDate } from '@/lib/format'

export const alt = 'Argo journal'
export const size = ogSize
export const contentType = ogContentType

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  return ogCard({
    eyebrow: post?.category ?? 'journal',
    title: post?.title ?? 'Argo journal',
    footer: post ? `${post.author} · ${formatPostDate(post.publishedAt)}` : 'argorobotics.rs',
  })
}
