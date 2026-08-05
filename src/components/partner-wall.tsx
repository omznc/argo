import { getPartnerTiers } from '@/lib/content'
import type { Partner } from '@/lib/content-types'

/**
 * Partner logos sit on light plaques because most are supplied as dark marks
 * with no negative version. Each logo carries its own optical size cap.
 */
export async function PartnerWall() {
  const tiers = await getPartnerTiers()

  return (
    <div className="flex flex-col gap-[22px]">
      {tiers.map((tier) => (
        <div key={tier.label} className="grid items-center gap-6 md:grid-cols-[150px_1fr]">
          <div className="font-mono text-[11px] tracking-[.14em] text-dim uppercase">
            {tier.label}
          </div>
          <ul className="flex flex-wrap gap-3">
            {tier.partners.map((partner) => (
              <li
                key={partner.name}
                style={{ minWidth: tier.minWidth }}
                className="flex h-16 items-center justify-center rounded-[3px] bg-plaque px-[22px]"
              >
                <PartnerPlaque partner={partner} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/**
 * The logo, wrapped in a link when the partner has a site. Conditional rather
 * than an `<a>` with no href, because an anchor without one is not focusable
 * and announces to a screen reader as a link that goes nowhere.
 */
function PartnerPlaque({ partner }: { partner: Partner }) {
  const logo = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={partner.logo.url}
      alt={partner.name}
      loading="lazy"
      decoding="async"
      style={{ maxHeight: partner.maxHeight, maxWidth: partner.maxWidth }}
      className="object-contain"
    />
  )

  if (!partner.website) return logo

  return (
    <a
      href={partner.website}
      target="_blank"
      /* `sponsored` is the rel Google asks for on paid placements, which is
         what a sponsor logo is — without it these read as editorial endorsements. */
      rel="noreferrer noopener sponsored"
      className="flex items-center justify-center transition-opacity hover:opacity-70"
    >
      {logo}
    </a>
  )
}
