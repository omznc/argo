import { Container, GhostLink, PrimaryLink } from '@/components/ui'

export default function NotFound() {
  return (
    <Container className="py-24 md:py-32">
      <div className="font-mono text-[13px] text-dim">[ 404 ]</div>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,62px)] leading-none font-extrabold tracking-[-0.03em] text-bone">
        Off the map<span className="text-argo-yellow">.</span>
      </h1>
      <p className="mt-[22px] max-w-[600px] font-display text-lg leading-[1.5] text-muted">
        That page does not exist — it may have been renamed, or never launched in the first place.
      </p>
      <div className="mt-9 flex flex-wrap gap-[14px]">
        <PrimaryLink href="/">back to home</PrimaryLink>
        <GhostLink href="/projects">browse projects</GhostLink>
      </div>
    </Container>
  )
}
