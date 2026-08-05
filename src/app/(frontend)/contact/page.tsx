import type { Metadata } from 'next'

import { ContactForm } from '@/components/contact-form'
import { BreadcrumbJsonLd } from '@/components/structured-data'
import { Container } from '@/components/ui'
import { getContactForm, getSettings } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return {
    alternates: { canonical: '/contact' },
    title: 'Contact',
    description: `Get in touch with ${settings.siteName} — sponsorship, joining the team, press and talks.`,
  }
}

export default async function ContactPage() {
  const [settings, form] = await Promise.all([getSettings(), getContactForm()])

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: settings.siteName, path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
      />

      <Container className="pt-14 pb-10">
        <div className="mb-5 font-mono text-xs text-dim">
          <span className="text-[#a7aaa4]">contact</span>
        </div>
        <h1 className="font-display text-[clamp(2.25rem,6vw,62px)] leading-none font-extrabold tracking-[-0.03em] text-bone">
          Get in touch
        </h1>
        <p className="mt-[22px] max-w-[760px] font-display text-lg leading-[1.5] text-muted md:text-[22px]">
          Sponsorship, joining the team, press, or an invitation to come and talk — all of it lands
          in the same place.
        </p>
      </Container>

      <Container className="pb-24">
        <div className="grid gap-14 border-t border-white/[.09] pt-12 md:grid-cols-[1fr_260px] md:gap-16">
          <div className="max-w-[560px]">
            {form ? (
              <ContactForm form={form} />
            ) : (
              /* No form configured in the Settings global — the email address
                 below is still a complete answer to the page's question. */
              <p className="font-display text-lg leading-[1.6] text-muted">
                The quickest way to reach us is email.
              </p>
            )}
          </div>

          {/* The address stays on the page whether or not the form is
              configured, and works with JavaScript off. */}
          <aside className="flex flex-col gap-8">
            <div>
              <div className="mb-3 font-mono text-[11px] tracking-[.14em] text-dim uppercase">
                email
              </div>
              <a
                href={`mailto:${settings.email}`}
                className="font-display text-lg font-bold break-all text-bone transition-colors hover:text-argo-yellow"
              >
                {settings.email}
              </a>
              {settings.contactNote && (
                <p className="mt-3 font-mono text-[13px] leading-[1.6] text-dim">
                  {settings.contactNote}
                </p>
              )}
            </div>

            {settings.socials.length > 0 && (
              <div>
                <div className="mb-3 font-mono text-[11px] tracking-[.14em] text-dim uppercase">
                  elsewhere
                </div>
                <ul className="flex flex-col gap-2 font-mono text-[13px]">
                  {settings.socials.map((social) => (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[#a7aaa4] transition-colors hover:text-argo-yellow"
                      >
                        {social.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  )
}
