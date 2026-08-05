import { getPartnerTiers } from '@/lib/content'
import type { Partner } from '@/lib/content-types'

/**
 * The plaque box at a tier scale of 1, in px. Tall enough to clear the tallest
 * logo cap with the surround the design asks for; everything else in the plaque
 * is derived from it so a tier scale moves the whole row as one piece.
 */
const PLAQUE_HEIGHT = 80

/**
 * Partner logos sit on light plaques because most are supplied as dark marks
 * with no negative version. Each logo carries its own optical size cap, and its
 * tier carries a scale on top — see `logoScale` on the partner-tiers collection.
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
                style={{
                  minWidth: Math.round(tier.minWidth * tier.scale),
                  height: Math.round(PLAQUE_HEIGHT * tier.scale),
                  paddingInline: Math.round(22 * tier.scale),
                }}
                className="flex items-center justify-center rounded-[3px] bg-plaque"
              >
                <PartnerPlaque partner={partner} scale={tier.scale} />
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
function PartnerPlaque({ partner, scale }: { partner: Partner; scale: number }) {
  const logo = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={partner.logo.url}
      alt={partner.name}
      loading="lazy"
      decoding="async"
      style={{
        maxHeight: Math.round(partner.maxHeight * scale),
        maxWidth: Math.round(partner.maxWidth * scale),
      }}
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
