import { getSettings } from '@/lib/content'

import { Container, PrimaryLink } from './ui'

export async function SiteFooter() {
  const settings = await getSettings()

  return (
    <footer id="contact" className="relative z-10 overflow-hidden pt-28 pb-10">
      {/* The yellow dawn rising out of the bottom edge. */}
      <div aria-hidden="true" className="argo-dawn absolute inset-x-0 bottom-0 z-0 h-[340px]" />

      {/* Aurora drifting over the dawn. Purely additive — see globals.css. */}
      <div aria-hidden="true" className="argo-aurora absolute inset-x-0 bottom-0 z-0 h-[520px]">
        <span className="argo-aurora-band argo-aurora-band-1" />
        <span className="argo-aurora-band argo-aurora-band-2" />
        <span className="argo-aurora-band argo-aurora-band-3" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 font-mono text-[13px] text-muted">[ get in touch ]</div>
            <a
              href={`mailto:${settings.email}`}
              className="font-display text-3xl font-extrabold tracking-[-0.02em] text-bone transition-colors hover:text-argo-yellow sm:text-[40px]"
            >
              {settings.email}
            </a>
            {settings.contactNote && (
              <div className="mt-3 font-mono text-[13px] text-dim">{settings.contactNote}</div>
            )}

            {/* The mailto above is the route that works with JavaScript off;
                this is the one that reaches the team as a tracked submission. */}
            <PrimaryLink href="/contact" className="mt-7">
              send a message
            </PrimaryLink>
          </div>

          <ul className="flex gap-[10px]">
            {settings.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex border border-white/[.16] px-[15px] py-[11px] font-mono text-xs text-[#a7aaa4] transition-colors hover:border-argo-yellow hover:text-argo-yellow"
                >
                  {/* The two-letter mark is the design; the full name is what a
                      screen reader should announce. */}
                  <span aria-hidden="true">{social.label}</span>
                  <span className="sr-only">{social.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-dim">
          {/* Matches the header lockup — the footer mark reading half its size
              was an oversight, not a hierarchy decision. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/argo-lockup-white.svg" alt="Argo Robotics" className="h-8 w-auto md:h-10" />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>copyright argo · belgrade, serbia</span>

            <a
              href="https://omarzunic.com"
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-argo-yellow"
            >
              site by omznc
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
