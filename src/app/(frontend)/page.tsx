import Link from 'next/link'

import { PartnerWall } from '@/components/partner-wall'
import { ProjectCard, ProjectChip } from '@/components/project-card'
import { WebSiteJsonLd } from '@/components/structured-data'
import { Container, GhostLink, PrimaryLink, SectionLabel } from '@/components/ui'
import { getActiveProjects, getProjectCounts, getShippedProjects } from '@/lib/content'

export default async function HomePage() {
  const [active, shipped, counts] = await Promise.all([
    getActiveProjects(),
    getShippedProjects(),
    getProjectCounts(),
  ])

  return (
    <>
      <WebSiteJsonLd />

      {/* ---------------------------------------------------------- hero */}
      <Container className="pt-14 pb-16 md:pt-20 md:pb-[66px]">
        <div className="mb-[26px] font-mono text-xs tracking-[.24em] text-[#9a9e97] uppercase">
          Student Space Research Laboratory · Belgrade
        </div>

        <h1 className="font-mono text-[clamp(2.5rem,7vw,66px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-bone">
          Building{' '}
          {/* The gas fill needs the word twice — once in flow, once in
              `content: attr(data-text)`. See `.argo-gas` in globals.css. */}
          <span className="argo-gas" data-text="next-gen">
            next-gen
          </span>
          <br />
          rovers and rockets<span className="text-argo-yellow">.</span>
        </h1>

        <p className="mt-[26px] mb-9 max-w-[600px] font-display text-lg leading-[1.6] text-muted md:text-xl">
          Argo is a student team from the University of Belgrade designing autonomous rovers and
          experimental rockets.
        </p>

        <div className="flex flex-wrap gap-[14px]">
          <PrimaryLink href="/projects">explore projects</PrimaryLink>
          <GhostLink href="/#mission">read the mission</GhostLink>
        </div>

        <div className="mt-11 flex flex-wrap items-center gap-x-[22px] gap-y-2 font-mono text-[13px] text-dim">
          <span>Belgrade · University of Belgrade</span>
          <span className="text-hairline">/</span>
          <span>
            Next — <span className="text-[#a7aaa4]">ERC 2026</span>
          </span>
          <span className="text-hairline">/</span>
          <span>
            Excalibur target — <span className="text-[#a7aaa4]">4 km apogee</span>
          </span>
        </div>
      </Container>

      {/* ------------------------------------------------------- mission */}
      <section id="mission" className="border-t border-white/[.09]">
        <Container className="py-16">
          <div className="mb-5">
            <SectionLabel>mission</SectionLabel>
          </div>
          <p className="max-w-[960px] font-display text-xl leading-[1.5] text-bone-soft md:text-[26px]">
            We promote student innovation in robotics and aerospace through hands-on projects,
            research, and competition — control systems, avionics, manufacturing, testing, and
            public outreach. We aim to represent Serbia in international competitions like the{' '}
            <span className="text-argo-yellow">European Rover Challenge</span>.
          </p>
        </Container>
      </section>

      {/* ------------------------------------------------------ projects */}
      <section className="border-t border-white/[.09]">
        <Container className="pt-16 pb-10">
          <div className="mb-7 flex items-baseline justify-between">
            <SectionLabel>projects</SectionLabel>
            <Link
              href="/projects"
              className="font-mono text-xs text-faint transition-colors hover:text-[#a7aaa4]"
            >
              {counts.active} active · {counts.shipped} shipped
            </Link>
          </div>

          <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
            {active.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shipped.map((project) => (
              <ProjectChip key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ partners */}
      <section id="partners" className="border-t border-white/[.09]">
        <Container className="pt-[60px] pb-16">
          <div className="mb-[30px]">
            <SectionLabel>backed by</SectionLabel>
          </div>
          <PartnerWall />
        </Container>
      </section>
    </>
  )
}
