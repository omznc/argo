import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { HeroImage } from '@/components/hero-image'
import { ArrowRight } from '@/components/icons'
import { ProjectSkeleton } from '@/components/skeletons'
import { ProjectJsonLd } from '@/components/structured-data'
import { Container, SectionLabel, Tag } from '@/components/ui'
import { getNextProject, getProject, getProjects } from '@/lib/content'

type Params = { slug: string }

/**
 * Prerenders every project at build time. Under Cache Components this is no
 * longer the thing that makes navigation instant — the App Shell is — but it
 * still means a first visit to a known slug serves finished HTML rather than
 * rendering it. Slugs not listed here are rendered on request behind the shell,
 * and `notFound()` below is what rejects the ones that aren't real (there is no
 * `dynamicParams` under Cache Components).
 */
export async function generateStaticParams(): Promise<Params[]> {
  const projects = await getProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  // The slug is only validated inside the Suspense boundary below, by which point
  // the shell has already streamed as a 200 and the status can no longer change.
  // noindex keeps that soft 404 out of search results.
  if (!project) return { title: 'Not found', robots: { index: false, follow: false } }

  return {
    title: project.title,
    description: project.excerpt,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title: project.title, description: project.excerpt, type: 'article' },
  }
}

/**
 * The params promise is handed straight to the boundary rather than awaited
 * here: everything on this page is derived from the slug, so awaiting at the top
 * would tie the App Shell to a single URL and there would be nothing left to
 * share across links.
 */
export default function ProjectPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectView params={params} />
    </Suspense>
  )
}

async function ProjectView({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const next = await getNextProject(slug)

  return (
    <>
      <ProjectJsonLd project={project} />

      {/* ------------------------------------------------- project header */}
      <Container className="pt-14 pb-10">
        <div className="mb-[22px] font-mono text-xs text-dim">
          <Link href="/projects" className="text-[#a7aaa4] transition-colors hover:text-bone">
            projects
          </Link>{' '}
          / {project.slug}
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-[14px] font-mono text-xs">
          {project.status === 'active' ? (
            <span className="text-argo-yellow">● active</span>
          ) : (
            <span className="text-faint">✓ shipped</span>
          )}
          <span className="text-faint">{project.cycle}</span>
          {project.target && (
            <>
              <span className="text-faint">·</span>
              <span className="text-faint">{project.target}</span>
            </>
          )}
        </div>

        <h1 className="font-display text-[clamp(2.25rem,6vw,62px)] leading-none font-extrabold tracking-[-0.03em] text-bone">
          {project.title}
        </h1>
        <p className="mt-[22px] max-w-[760px] font-display text-lg leading-[1.5] text-muted md:text-[22px]">
          {project.lede}
        </p>
      </Container>

      {/* --------------------------------------------------------- hero */}
      <Container>
        <HeroImage
          image={project.heroImage}
          caption={project.heroCaption}
          className="h-[220px] md:h-[360px]"
        />
      </Container>

      {/* -------------------------------------------------- body + meta */}
      <Container className="grid gap-12 pt-14 pb-5 lg:grid-cols-[1fr_300px]">
        <div className="font-display">
          <div className="mb-3.5">
            <SectionLabel>overview</SectionLabel>
          </div>
          {project.body.map((paragraph, i) => (
            <p
              key={i}
              className={`text-[17px] leading-[1.7] text-bone-dim ${
                i === project.body.length - 1 ? 'mb-9' : 'mb-5'
              }`}
            >
              {paragraph}
            </p>
          ))}

          <div className="mb-4">
            <SectionLabel>subsystems</SectionLabel>
          </div>
          <dl className="flex flex-col border border-white/10">
            {project.subsystems.map((subsystem, i) => (
              <div
                key={subsystem.name}
                className={`grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-5 ${
                  i < project.subsystems.length - 1 ? 'border-b border-white/[.08]' : ''
                }`}
              >
                <dt className="font-mono text-[13px] text-argo-yellow">{subsystem.name}</dt>
                <dd className="text-[14.5px] text-muted">{subsystem.summary}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="font-mono">
          <div className="border border-white/[.12] p-[22px]">
            <div className="mb-4 text-[11px] tracking-[.14em] text-dim uppercase">Project</div>
            <dl className="flex flex-col gap-3.5 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-dim">status</dt>
                <dd className={project.status === 'active' ? 'text-argo-yellow' : 'text-bone-dim'}>
                  {project.status}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-dim">cycle</dt>
                <dd className="text-bone-dim">{project.cycle}</dd>
              </div>
              {project.target && (
                <div className="flex justify-between gap-4">
                  <dt className="text-dim">target</dt>
                  <dd className="text-bone-dim">{project.target}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-dim">domain</dt>
                <dd className="text-bone-dim">{project.domain}</dd>
              </div>
            </dl>

            <div className="my-5 h-px bg-white/10" />

            <div className="mb-3 text-[11px] tracking-[.14em] text-dim uppercase">Tags</div>
            <ul className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li key={tag}>
                  <Tag>{tag}</Tag>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>

      {/* ------------------------------------------------- next project */}
      {next && (
        <Container className="pt-5 pb-[70px]">
          <Link
            href={`/projects/${next.slug}`}
            className="group flex flex-wrap items-center justify-between gap-4 border border-white/10 px-7 py-6 transition-colors hover:border-argo-yellow/40"
          >
            <span className="font-mono text-xs text-dim">next project</span>
            <span className="font-display text-[22px] font-bold text-bone">{next.title}</span>
            <ArrowRight
              size={18}
              className="text-argo-yellow transition-transform group-hover:translate-x-1"
            />
          </Link>
        </Container>
      )}
    </>
  )
}
