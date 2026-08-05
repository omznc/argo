import Image from 'next/image'

import type { Member } from '@/lib/content-types'

/**
 * Two initials, from the first and last word of the name — so "Ana Marija
 * Petrović" reads as AP rather than AM. Falls back to the first character for a
 * single-word name, and to nothing at all for a name with no letters in it,
 * which the monogram renders as an empty tile rather than throwing.
 */
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : ''
  return `${first}${last}`.toUpperCase()
}

/**
 * A member in the grid. The photo is optional by design — a team gains people
 * faster than it gets everyone in front of a camera — so the frame falls back to
 * an initials monogram at the same size, and the row keeps its rhythm.
 *
 * The monogram is `aria-hidden`: the name is already the next line of text, and
 * a screen reader announcing "A P, Ana Petrović" is noise.
 */
export function MemberCard({ member }: { member: Member }) {
  return (
    <li>
      <div className="relative aspect-square overflow-hidden border border-white/[.09] bg-ink-haze">
        {member.photo ? (
          <Image
            src={member.photo.url}
            alt={member.photo.alt}
            fill
            /* The grid runs from two columns on a phone to five on a desktop,
               so the largest a card is ever drawn is about 240px. */
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center font-display text-2xl font-extrabold tracking-[-0.02em] text-faint"
          >
            {initials(member.name)}
          </div>
        )}
      </div>

      <div className="mt-[14px] font-display text-[15px] leading-tight font-bold text-bone">
        {member.name}
      </div>

      {member.focus && (
        <div className="mt-[6px] font-mono text-[11px] leading-[1.5] text-dim">{member.focus}</div>
      )}

      {member.links.length > 0 && (
        <ul className="mt-[10px] flex flex-wrap gap-x-3 gap-y-1">
          {member.links.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[11px] text-[#a7aaa4] transition-colors hover:text-argo-yellow"
              >
                {link.name}
                {/* The link text is a bare word like "GitHub", which repeats
                    across every card — the name disambiguates it in a screen
                    reader's link list. */}
                <span className="sr-only"> — {member.name}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
