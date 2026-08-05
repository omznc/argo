import { Container } from './ui'

/**
 * The App Shell for the two [slug] routes.
 *
 * Under Partial Prefetching, Next.js builds one shell per route and shares it
 * across every link pointing there, so it can only contain what doesn't depend
 * on the URL. On a project or journal page that is the page's shape and nothing
 * else — these are what a <Link> prefetches and what paints the instant the user
 * clicks, with the real content streaming in behind it.
 *
 * They mirror the real layouts block for block so nothing shifts on arrival.
 */

function Bar({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-[2px] bg-white/[.06] ${className}`} />
}

function Hatch({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`argo-hatch border border-white/[.12] ${className}`} />
}

export function ProjectSkeleton() {
  return (
    <div role="status" aria-label="Loading project">
      <span className="sr-only">Loading project</span>

      <Container className="pt-14 pb-10">
        <Bar className="mb-[22px] h-3 w-40" />
        <div className="mb-5 flex flex-wrap gap-[14px]">
          <Bar className="h-3 w-16" />
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-20" />
        </div>
        <Bar className="h-[clamp(2.25rem,6vw,62px)] w-full max-w-[520px]" />
        <div className="mt-[22px] flex max-w-[760px] flex-col gap-2.5">
          <Bar className="h-5 w-full" />
          <Bar className="h-5 w-4/5" />
        </div>
      </Container>

      <Container>
        <Hatch className="h-[220px] md:h-[360px]" />
      </Container>

      <Container className="grid gap-12 pt-14 pb-5 lg:grid-cols-[1fr_300px]">
        <div>
          <Bar className="mb-3.5 h-3 w-24" />
          <div className="mb-9 flex flex-col gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Bar key={i} className={`h-4 ${i % 4 === 3 ? 'w-3/5' : 'w-full'}`} />
            ))}
          </div>

          <Bar className="mb-4 h-3 w-28" />
          <div className="flex flex-col border border-white/10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-5 ${
                  i < 3 ? 'border-b border-white/[.08]' : ''
                }`}
              >
                <Bar className="h-3.5 w-28" />
                <Bar className="h-3.5 w-full" />
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="border border-white/[.12] p-[22px]">
            <Bar className="mb-4 h-3 w-20" />
            <div className="flex flex-col gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <Bar className="h-3 w-16" />
                  <Bar className="h-3 w-20" />
                </div>
              ))}
            </div>
            <div className="my-5 h-px bg-white/10" />
            <Bar className="mb-3 h-3 w-12" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Bar key={i} className="h-6 w-16" />
              ))}
            </div>
          </div>
        </aside>
      </Container>
    </div>
  )
}

export function PostSkeleton() {
  return (
    <div role="status" aria-label="Loading article">
      <span className="sr-only">Loading article</span>

      <div className="mx-auto w-full max-w-[848px] px-6 pt-14 md:px-11">
        <Bar className="mb-5 h-3 w-36" />
        <Bar className="mb-[22px] h-[26px] w-32" />
        <div className="flex flex-col gap-3">
          <Bar className="h-[clamp(2rem,5vw,46px)] w-full" />
          <Bar className="h-[clamp(2rem,5vw,46px)] w-3/5" />
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <Bar className="h-3 w-28" />
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-20" />
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-[848px] px-6 md:px-11">
        <Hatch className="h-[220px] md:h-[340px]" />
      </div>

      <div className="mx-auto w-full max-w-[848px] px-6 pt-11 pb-5 md:px-11">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Bar key={i} className={`h-4 ${i % 5 === 4 ? 'w-2/3' : 'w-full'}`} />
          ))}
        </div>
        <div className="mt-[34px] flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} className="h-6 w-20" />
          ))}
        </div>
      </div>
    </div>
  )
}
