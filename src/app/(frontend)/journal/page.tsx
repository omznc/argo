import type { Metadata } from 'next'
import Link from 'next/link'

import { PostListJsonLd } from '@/components/structured-data'
import { Container } from '@/components/ui'
import { formatPostDate } from '@/lib/format'
import { getPosts } from '@/lib/content'

export const metadata: Metadata = {
  alternates: { canonical: '/journal' },
  title: 'Journal',
  description: 'Engineering notes and team writing from the Argo student laboratory.',
}

export default async function JournalPage() {
  const posts = await getPosts()

  return (
    <>
      <PostListJsonLd posts={posts} />

      <Container className="pt-14 pb-10">
        <div className="mb-5 font-mono text-xs text-dim">
          <span className="text-[#a7aaa4]">journal</span>
        </div>
        <h1 className="font-display text-[clamp(2.25rem,6vw,62px)] leading-none font-extrabold tracking-[-0.03em] text-bone">
          Journal
        </h1>
        <p className="mt-[22px] max-w-[760px] font-display text-lg leading-[1.5] text-muted md:text-[22px]">
          Build notes, post-mortems and the occasional argument about why we do this — written by
          the people doing the work.
        </p>
      </Container>

      <Container className="pb-16">
        <ul className="flex flex-col border-t border-white/[.09]">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-white/[.09]">
              {/* Bleeds 16px past the text on both sides so the hover tint never
                  crops flush against the category and date. */}
              <Link
                href={`/journal/${post.slug}`}
                className="group -mx-4 grid gap-3 rounded-lg px-4 py-8 transition-colors hover:bg-white/[.02] md:grid-cols-[160px_1fr] md:gap-8"
              >
                <div className="font-mono text-xs text-dim">
                  <div className="text-argo-yellow">{post.category}</div>
                  <div className="mt-1.5">{formatPostDate(post.publishedAt)}</div>
                </div>
                <div>
                  <h2 className="font-display text-2xl leading-tight font-bold text-bone transition-colors group-hover:text-argo-yellow md:text-[30px]">
                    {post.title}
                  </h2>
                  <p className="mt-3 max-w-[680px] font-display text-[15px] leading-[1.6] text-muted">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 font-mono text-xs text-faint">
                    {post.author} · {post.readingMinutes} min read
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  )
}
