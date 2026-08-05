import type { Metadata, Viewport } from 'next'
import { Archivo, JetBrains_Mono, Space_Grotesk } from 'next/font/google'

import { EagerNavigation } from '@/components/eager-navigation'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { OrganizationJsonLd } from '@/components/structured-data'
import { getSettings } from '@/lib/content'
import { siteUrl } from '@/lib/site'

import './globals.css'

/**
 * Weights are listed explicitly, which selects static instances rather than the
 * variable font. Measured both ways on this build: static is 195 KB across 12
 * files, variable 215 KB across the same 12 — `next/font` already emits only
 * the subsets in use, so a variable axis just adds the weights nothing renders.
 * Add a weight here when the design starts using one.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

/**
 * Async because the copy now lives in the Settings global. `getSettings()` is a
 * `use cache` read, so this still resolves at build time and the shell stays
 * prerendered — the metadata is not what makes a route dynamic, an uncached
 * read would be.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: '/' },
    title: {
      default: settings.metaTitle,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.description,
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      locale: 'en_RS',
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  }
}

export const viewport: Viewport = {
  themeColor: '#08090b',
  colorScheme: 'dark',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${archivo.variable}`}
    >
      {/* Column layout so `main` absorbs the slack on a page shorter than the
          viewport — otherwise the footer stops mid-screen and its dawn gradient
          leaves a band of bare background under it. */}
      <body className="relative flex min-h-screen flex-col overflow-x-hidden">
        {/* Clips the top decorations to the page box — their fixed heights would
            otherwise outrun short pages and add dead scroll below the footer. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* The glow the design opens every frame with, anchored to the top of the page. */}
          <div className="argo-veil absolute inset-x-0 top-0 h-[1400px]" />

          {/* Aurora over the veil. Invisible on first paint, fading up over 2s. */}
          <div className="argo-aurora argo-aurora-top absolute inset-x-0 top-0 h-[560px]">
            <span className="argo-aurora-band argo-aurora-band-1" />
            <span className="argo-aurora-band argo-aurora-band-2" />
            <span className="argo-aurora-band argo-aurora-band-3" />
          </div>
        </div>

        <a
          href="#main"
          className="sr-only font-mono text-sm focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-argo-yellow focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>

        <OrganizationJsonLd />
        <EagerNavigation />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
