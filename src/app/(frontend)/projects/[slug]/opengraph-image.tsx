import { ogCard, ogContentType, ogSize } from '@/lib/og'
import { getProject, getProjects } from '@/lib/content'

export const alt = 'Argo project'
export const size = ogSize
export const contentType = ogContentType

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)

  return ogCard({
    eyebrow: project ? `${project.status} · ${project.domain}` : 'project',
    title: project?.title ?? 'Argo',
    footer: project ? project.cycle : 'argorobotics.rs',
  })
}
