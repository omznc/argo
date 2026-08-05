import type { Metadata } from 'next'

import { ProjectCard, ProjectChip } from '@/components/project-card'
import { ProjectListJsonLd } from '@/components/structured-data'
import { Container, SectionLabel } from '@/components/ui'
import { getActiveProjects, getShippedProjects } from '@/lib/content'

export const metadata: Metadata = {
  alternates: { canonical: '/projects' },
  title: 'Projects',
  description:
    'Rovers, rockets and avionics built by the Argo student laboratory at the University of Belgrade.',
}

export default async function ProjectsPage() {
  const [active, shipped] = await Promise.all([getActiveProjects(), getShippedProjects()])

  return (
    <>
      <ProjectListJsonLd projects={[...active, ...shipped]} />

      <Container className="pt-14 pb-10">
        <div className="mb-5 font-mono text-xs text-dim">
          <span className="text-[#a7aaa4]">projects</span>
        </div>
        <h1 className="font-display text-[clamp(2.25rem,6vw,62px)] leading-none font-extrabold tracking-[-0.03em] text-bone">
          Projects
        </h1>
        <p className="mt-[22px] max-w-[760px] font-display text-lg leading-[1.5] text-muted md:text-[22px]">
          Everything the laboratory has in the air, on the ground, or in the archive — built by
          student teams across electrical, mechanical and software engineering.
        </p>
      </Container>

      <Container className="pb-10">
        <div className="mb-7">
          <SectionLabel>in progress</SectionLabel>
        </div>
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {active.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Container>

      <Container className="pb-16">
        <div className="mb-7">
          <SectionLabel>shipped</SectionLabel>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shipped.map((project) => (
            <ProjectChip key={project.slug} project={project} />
          ))}
        </div>
      </Container>
    </>
  )
}
