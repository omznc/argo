import type { Metadata } from 'next'

import { MemberCard } from '@/components/member-card'
import { BreadcrumbJsonLd, MemberListJsonLd } from '@/components/structured-data'
import { Container } from '@/components/ui'
import { getMemberRoles, getSettings } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return {
    alternates: { canonical: '/members' },
    title: 'Members',
    description: `The students behind ${settings.siteName} — the teams building the rovers, rockets and avionics.`,
  }
}

export default async function MembersPage() {
  const [settings, roles] = await Promise.all([getSettings(), getMemberRoles()])

  return (
    <>
      <MemberListJsonLd roles={roles} />
      <BreadcrumbJsonLd
        trail={[
          { name: settings.siteName, path: '/' },
          { name: 'Members', path: '/members' },
        ]}
      />

      <Container className="pt-14 pb-10">
        <div className="mb-5 font-mono text-xs text-dim">
          <span className="text-[#a7aaa4]">members</span>
        </div>
        <h1 className="font-display text-[clamp(2.25rem,6vw,62px)] leading-none font-extrabold tracking-[-0.03em] text-bone">
          Members
        </h1>
        <p className="mt-[22px] max-w-[760px] font-display text-lg leading-[1.5] text-muted md:text-[22px]">
          Argo is students. Every subsystem on every project is designed, built and tested by the
          people below, across electrical, mechanical and software engineering.
        </p>
      </Container>

      <Container className="pb-24">
        {/* Each role is its own section rather than one long grid with dividers,
            so the heading and the people under it are associated for a screen
            reader as well as visually. */}
        {roles.map((role) => (
          <section key={role.label} className="border-t border-white/[.09] pt-9 pb-14 last:pb-0">
            <div className="mb-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <h2 className="font-mono text-[11px] tracking-[.14em] text-bone-soft uppercase">
                {role.label}
              </h2>
              {role.blurb && (
                <p className="font-mono text-[11px] leading-[1.6] text-dim">{role.blurb}</p>
              )}
            </div>

            <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {/* Keyed by position, not by name — two students can share one,
                  and the list is static per render. */}
              {role.members.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </ul>
          </section>
        ))}

        {/* A team page with nobody on it is a real state on a fresh database.
            Saying so is better than an empty band of whitespace. */}
        {roles.length === 0 && (
          <p className="border-t border-white/[.09] pt-9 font-display text-lg text-muted">
            The roster is being updated.
          </p>
        )}
      </Container>
    </>
  )
}
