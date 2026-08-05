import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { HeroImage } from '@/components/hero-image'
import { PostBody } from '@/components/post-body'
import { PostSkeleton } from '@/components/skeletons'
import { PostJsonLd } from '@/components/structured-data'
import { Tag } from '@/components/ui'
import { getPost, getPosts } from '@/lib/content'
import { formatPostDate } from '@/lib/format'

type Params = { slug: string }

/** See the note on the project route — same prerender/App Shell split. */
export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  // The slug is only validated inside the Suspense boundary below, by which point
  // the shell has already streamed as a 200 and the status can no longer change.
  // noindex keeps that soft 404 out of search results.
  if (!post) return { title: 'Not found', robots: { index: false, follow: false } }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  }
}

export default function PostPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostView params={params} />
    </Suspense>
  )
}

async function PostView({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <article>
      <PostJsonLd post={post} />

      {/* ------------------------------------------------ article header */}
      <div className="mx-auto w-full max-w-[848px] px-6 pt-14 md:px-11">
        <div className="mb-5 font-mono text-xs text-dim">
          <Link href="/journal" className="text-[#a7aaa4] transition-colors hover:text-bone">
            journal
          </Link>{' '}
          / {post.category.toLowerCase()}
        </div>

        <span className="mb-[22px] inline-block border border-argo-yellow/40 px-[10px] py-[5px] font-mono text-[11px] tracking-[.16em] text-argo-yellow uppercase">
          {post.category}
        </span>

        <h1 className="font-display text-[clamp(2rem,5vw,46px)] leading-[1.1] font-extrabold tracking-[-0.02em] text-bone">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[13px] text-dim">
          <span className="text-[#a7aaa4]">{post.author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>

      {/* --------------------------------------------------------- hero */}
      <div className="mx-auto mt-8 w-full max-w-[848px] px-6 md:px-11">
        <HeroImage
          image={post.heroImage}
          caption={post.heroCaption}
          className="h-[220px] md:h-[340px]"
        />
      </div>

      {/* --------------------------------------------------------- body */}
      <div className="mx-auto w-full max-w-[848px] px-6 pt-11 pb-5 font-display md:px-11">
        <PostBody post={post} />

        <ul className="mt-[34px] flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
