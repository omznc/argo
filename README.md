# Argo

Frontend for the Argo student space research laboratory, built from the
`Argo Site v2` design direction (tight lockup header, yellow-gradient footer
rising out of the bottom edge, mono-first type).

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Payload CMS 3 · Bun.

## Running

```bash
cp .env.example .env   # then set PAYLOAD_SECRET; the rest has working defaults
bun install
bun run migrate        # creates argo.db from src/migrations
bun run seed           # writes the design copy into Payload as published documents
bun dev                # http://localhost:3000
```

`PAYLOAD_SECRET` signs auth tokens (`openssl rand -base64 32`) and
`DATABASE_URI` points at the local SQLite file. Everything else in
`.env.example` is only read by `docker-compose.yml`.

The seed is idempotent by slug — running it again skips what is already there,
and `bun run seed --force` rewrites only the slugs it owns. Without it the site
builds and renders correctly but is empty, because every page now reads the CMS.
It writes the two projects, the journal posts, the Settings global, the partner
wall and the member roles; it deliberately writes **no members**, since those
are real students and inventing names for a public roster is worse than the
empty state the page already handles.

`bun run build && bun run start` for production. The Payload admin lives at
`/admin`; the first visit prompts you to create the initial user.

### The other scripts

| Command                        | What it's for                                                     |
| ------------------------------ | ----------------------------------------------------------------- |
| `bun run lint`                 | ESLint over the repo                                              |
| `bun run typecheck`            | `tsc --noEmit`                                                    |
| `bun run migrate:create <name>` | after **any** collection or global field change — see below       |
| `bun run generate:types`       | regenerates `src/payload-types.ts` from the config                |
| `bun run generate:importmap`   | after adding an admin component under `src/components/admin/`     |

**Schema changes need a migration, and dev will not tell you.** Payload
auto-pushes schema in development, so a new field works locally with no
migration and then fails in production with `no such table` or `has no column
named …`. After changing a collection or the Settings global, run
`bun run migrate:create <name>` and commit both files it writes.

## Layout

```
src/app/(frontend)   the public site — its own root layout, fonts, Tailwind
src/app/(payload)    admin UI + REST/GraphQL routes (Payload's own root layout)
src/components       header, footer, cards, partner wall, member cards, forms
src/lib              content accessors, seed copy, server actions, formatting
src/collections      Payload collections (see Content)
src/globals          Settings — site identity and the contact form pointer
src/migrations       generated schema migrations (commit these)
scripts              seed + the one-off asset importers
```

Two root layouts, one per route group, keep the frontend's Tailwind layer and
Payload's admin CSS from touching each other.

## Pages

| Route              | Design frame                     |
| ------------------ | -------------------------------- |
| `/`                | 5a — hero, mission, projects, backed by |
| `/projects`        | index (new, built in the same language) |
| `/projects/[slug]` | 5b — project post                |
| `/journal`         | index (new)                      |
| `/journal/[slug]`  | 5c — blog post                   |
| `/members`         | roster, grouped by role (new)    |
| `/contact`         | enquiry form (new)               |

The design's nav has four items; `journal` and `members` were added so the blog
and the roster are reachable, and `contact` became a page of its own once it
grew a form. `mission` and `partners` remain anchors on the home page.

## Instant navigation

The site runs on Next 16.3's Instant Navigations, enabled by two flags in
`next.config.ts`:

```ts
cacheComponents: true,
partialPrefetching: true,
```

**Cache Components** removes implicit caching. Nothing is cached or prerendered
unless it says so, which is why every accessor in `src/lib/content.ts` carries
`'use cache'` — that directive is what puts the content into the prerender, and
it will keep the Payload queries that replace those functions off the request
path too.

**Partial Prefetching** changes what a `<Link>` fetches. Instead of one prefetch
per link, Next builds a single App Shell per route and shares it across every
link pointing there. The shell can only hold what doesn't depend on the URL, so
the two `[slug]` routes pass the `params` promise into a `<Suspense>` boundary
rather than awaiting it at the top; `src/components/skeletons.tsx` is what ends
up in the shell, and it mirrors the real layout block for block so nothing
shifts when the content streams in. `bun run build` marks those shells `◐`.

`usePathname` and friends suspend while a shell is generated for a route with
dynamic params, so the header keeps its route reads in two leaves behind their
own boundaries (`ActiveNavAnchor`, `CloseOnRouteChange`). Everything else about
the header — logo, nav, CTA — stays in the shell.

`PendingUnderline` still uses `useLinkStatus()` to draw a yellow rule when a
navigation has to wait; with shells prefetched it should rarely appear.

### Eager activation

`EagerNavigation` (mounted once in the frontend layout) starts the navigation on
the event that commits to it — `pointerdown` for a mouse, `keydown` for Enter —
rather than waiting for the click, which buys back the press-to-release interval
on every link. It listens on the document, so it covers plain `<a>` as well as
`<Link>`.

The guards are the whole design:

- **Mouse only on pointerdown.** On touch, a press that becomes a scroll must
  not navigate, and touch has no click delay left to recover anyway.
- **Modified clicks are left alone**, so ctrl/cmd/shift/alt-click still opens
  tabs and windows.
- **External, `target`, `download` and `rel=external` links are skipped**, as
  are same-page hash links, which keep the browser's native scroll and history.
- **The follow-up click is neutralised.** It would otherwise navigate a second
  time and push a duplicate history entry. A capture-phase listener calls
  `preventDefault()` only — `next/link` bails on a defaultPrevented event, while
  propagation continues so React `onClick` handlers on the link still run.

Verified in a browser: mouse click and Enter each produce exactly one history
entry and one back press returns; ctrl-click leaves the current tab alone.

### Caching

Content is cached with `cacheLife('max')` and tagged with `cacheTag`, so pages
never expire on a timer — a CMS knows exactly when its content changed, so time
is the wrong trigger. `src/lib/revalidate.ts` supplies the Payload hooks that
expire those tags on publish, update and delete; `src/lib/cache-tags.ts` holds
the tag names, since collection config is also loaded by the Payload CLI and
must not pull in `server-only` code. Documents expire their own `projects:slug`
tag alongside the collection tag, so editing one project doesn't rebuild the
rest. The build report shows this as a 30d revalidate window rather than 15m.

Two behaviour notes worth knowing:

- **Unknown slugs are soft 404s.** `dynamicParams` doesn't exist under Cache
  Components, so `/projects/does-not-exist` streams the shell as a `200` and
  then renders the not-found UI — the status can't change once streaming has
  started. `generateMetadata` returns `noindex` for those, which keeps them out
  of search results. A real `404` status would mean checking the slug in
  `proxy.ts`, before the response streams.
- **Route state persists.** Next keeps routes mounted with React's `<Activity>`
  instead of unmounting them, so the mobile nav panel has to be closed
  deliberately on a route change rather than dying with the page.

The DevTools **Navigation Inspector** ("pause on navigations") is the way to see
these shells — prefetching is disabled in `next dev`, so run `bun run build &&
bun run start` to see the real behaviour.

`AGENTS.md` / `CLAUDE.md` at the repo root are written by `next dev` itself and
are meant to be committed.

## Aurora

Two aurora fields, sharing one set of curtain styles: warm over the footer's
`argo-dawn`, and a cooler, fainter one hanging from the top of the page over the
`argo-veil`. The top one is blue-led and held to lower alphas because the hero's
text sits on it; it fades up over 2s from first paint (`both` holds the
from-state so the first frame is clean).

Three curtains drift at 19s / 25s / 31s — pairwise coprime, so the composite
never visibly repeats. That irregularity is what reads as breathing rather than
looping. `skewX` gives the lean, `scaleY` the vertical breath.

Only `transform` and `opacity` animate. The blur rasterises once into a layer the
compositor then moves, so it stays off the main thread — measured across all six
curtains at a 4.2ms median frame, 8.9ms worst, zero frames over 20ms. Animating
the gradients themselves would repaint every frame.

**The top edge is the thing to be careful with.** Two rules have to agree or it
shows as a hard line across the page: the mask must reach fully transparent at
the clip boundary, *and* the band gradients must already be dim by the time they
reach it (hence the low gradient centres and small vertical radii). `contain:
paint` was doing the clipping originally and cut straight through the blur —
`overflow: hidden` clips in step with the mask instead.

The curtains are purely additive: `argo-dawn` and `argo-veil` remain underneath,
so removing them leaves no hole. Under `prefers-reduced-motion` they are dropped
outright rather than left to the site-wide rule that collapses
`animation-duration`, which would freeze them at an arbitrary keyframe.

Tuning knobs: `bottom`/`height` on `.argo-aurora-band` control how much of each
gradient core sits in view (push them too far and it flattens into a wash), and
the masks on `.argo-aurora` / `.argo-aurora-top` control how far they dissolve.

## SEO

- `src/lib/site.ts` holds the canonical origin; `NEXT_PUBLIC_SITE_URL` overrides
  it for preview deploys. `metadataBase`, canonicals, the sitemap, robots and the
  OG images all read from it, so a domain change is one edit.
- `src/app/robots.ts` and `src/app/(frontend)/sitemap.ts`. Note the asymmetry:
  `sitemap.ts` is picked up inside the `(frontend)` route group, `robots.ts` is
  **not** and has to sit at the app root. The sitemap is built from the same
  cached accessors as the pages, so it expires on the same Payload tags.
- Every page sets `alternates.canonical`.
- JSON-LD in `src/components/structured-data.tsx` — `Organization` and
  `WebSite` sitewide, `CreativeWork` per project, `BlogPosting` per journal
  post, `ItemList` on the index and members pages, and a `BreadcrumbList` on
  everything below the root. The Organization reads its name, socials and
  parent organisation from the Settings global. Serialised through
  `JSON.stringify` with `<` escaped, so editor copy can't break out of the tag.
- OG images via `next/og` (`src/lib/og.tsx`), prerendered per slug at build.
  There was no `og:image` at all before, which is what makes a pasted link unfurl
  as a bare grey box. The card uses satori's default sans rather than the site's
  mono — shipping a woff for JetBrains Mono would put it in the brand voice.

## Payload admin

`src/app/(payload)/custom.scss` restates Payload's own design tokens rather than
overriding component styles, so it survives Payload upgrades. The admin gets the
frontend's ink field and the yellow CTA. The one exception is the primary button,
which Payload drives off the elevation ramp instead of the accent tokens, so the
colour has to be stated on the button itself.

`admin.components.graphics` swaps in the Argo lockup and mark
(`src/components/admin/`). Adding components means re-running
`bun run generate:importmap` — the admin resolves them through that map, not
through normal imports. Not yet seen in a browser: the graphics don't render on
the create-first-user screen, only on login and in the nav once a user exists.

## Content

Everything on the site is editable in `/admin`. The collections:

| Collection                   | Holds                                              |
| ---------------------------- | -------------------------------------------------- |
| `Projects`, `Posts`          | the two content types, drafts enabled              |
| `Members`, `MemberRoles`     | the roster and the bands it groups into            |
| `Partners`, `PartnerTiers`   | the partner wall and its rows                      |
| `Media`, `MemberPhotos`, `PartnerLogos` | uploads, one collection per purpose     |
| `Users`                      | admin logins                                       |

Plus the `Settings` global — site name, description, contact details, socials —
which feeds the footer, every page's `<title>` and the Organization JSON-LD.
`src/lib/site.ts` holds the shipped values as a field-by-field fallback, because
a global has no row until something writes one.

Uploads are split into three collections rather than one because each wants its
own directory, sizes and validation: member photos are square portraits, partner
logos are marks on a plaque, `Media` is everything else. Each takes its
`staticDir` from `MEDIA_DIR` when set, which is how compose mounts one volume
across all three.

The site reads through `src/lib/content.ts`, the single seam between pages and
the CMS. Each accessor runs a `payload.find()` through the Local API — in
process, no HTTP hop — and maps the document onto the frontend types in
`content-types.ts`, so no component ever sees a Payload shape and a collection
can gain fields without a page changing.

Three things that are load-bearing there:

- **Every read filters on `_status: 'published'`.** Drafts are enabled on both
  collections, so a draft sits in the same table as a live document. Without
  that filter, saving a draft would publish it.
- **`pagination: false`**, because Payload's default limit is 10 and a team's
  project list quietly truncating at ten would be very hard to notice. If either
  collection outgrows one page, that is the line to revisit.
- **`depth: 1`** resolves `heroImage` to its media document and stops there.

`src/lib/seed.ts` is no longer read by the site — it is the input to
`scripts/seed.ts` and the record of the design's intended copy.

Journal posts are Lexical rich text. `src/components/post-body.tsx` renders them
through JSX converters that map each node onto the article's own type styles —
a paragraph typed in the admin is identical to one written in JSX — so editors
get a real editor without the design inheriting a prose stylesheet. The lede is
a separate field rather than the first paragraph, since it is set larger and has
to stay identifiable after an editor rewrites the body.

## Contact form

`/contact` renders whatever form the Settings global points at, built in the
admin with Payload's form builder. Submissions land in **Forms → Submissions**;
nothing is emailed yet, so someone has to look.

Three things hold it together:

- **`create` is closed on `form-submissions`.** The plugin ships it open, which
  would make `/api/form-submissions` a public write endpoint and let anyone POST
  straight past the honeypot and the validation. With it closed, the only way in
  is `submitContactForm` in `src/lib/actions.ts`, which reaches Payload through
  the Local API and so bypasses access control by design.
- **The form definition is re-read server-side**, never taken from the request,
  so a submission can't name a different form or a field the form doesn't have.
- **Only six field blocks are enabled** in `payload.config.ts`. Every enabled
  block is a type `src/components/contact-form-fields.tsx` has to draw, so
  leaving the rest on would let an editor build a page the site can't render.

A filled honeypot (`HONEYPOT_FIELD`) is answered with success — telling a bot it
failed only tells it what to fix.

## Assets

`scripts/import-assets.ts` pulls design assets out of a Claude Code session
transcript and writes them into `public/assets`, downscaling the raster logos —
several were print-resolution scans (one 4414px wide for a mark rendered at
34px tall).

`matf.png` and `3d-republika.png` exceed the design API's 256 KiB per-file read
cap, so they came from the brand pack instead via
`scripts/import-local-logo.ts <source> <target-filename>`. Use the same script
for any future logo that arrives as a local file.

Partner logos sit on light plaques (`--color-plaque`) because most are supplied
as dark marks with no negative version. Each carries its own `maxHeight` /
`maxWidth` so wordmarks and roundels land at the same optical weight — fields on
the Partner document, seeded from `src/lib/partners.ts`. That file is the
starting set only; after the first seed the wall is managed in the admin.

## Deploying

Everything the server needs is in `docker-compose.yml`: the site, and a Caddy
proxy that obtains and renews its own TLS certificate.

```bash
cp .env.example .env      # set PAYLOAD_SECRET, SITE_DOMAIN, TLS_EMAIL
docker compose up -d --build
```

Point the domain's A record at the host first — Caddy validates over HTTP and
will retry until it resolves. Then open `/admin`; the first visit creates the
initial user.

Three things about this setup are deliberate and worth understanding before
changing them.

**The build happens at container start, not in the image.** The site is
prerendered from the CMS, so `next build` has to read the real database — which
lives on a volume that does not exist while the image is being built. The
entrypoint therefore migrates, seeds an empty collection, builds, then serves.
It costs roughly 30 seconds on boot and is why the image keeps its dev
dependencies. It also means `NEXT_PUBLIC_SITE_URL` can come from compose rather
than being baked into the image.

**An empty collection cannot be built.** Under Cache Components every
`generateStaticParams` must return at least one result, so `next build` fails
outright if there are no projects or no posts. The entrypoint runs
`bun run seed --if-empty` on every boot to guarantee one of each; once an editor
has written anything it is a permanent no-op. This is the reason a fresh deploy
works at all.

**Schema changes need a migration** — see Running. A field that works locally
with no migration fails here with `no such table`.

Three volumes hold everything that matters. `argo-data` is the database and
`argo-media` the uploaded files — **back up both together**, since Payload keeps
the file on disk and only a row pointing at it in the database, so either one
alone is useless. `argo-next` holds the build output and Next's incremental
cache, so a page revalidated by an editor's publish survives a restart.

To update: `git pull && docker compose up -d --build`. Set
`ARGO_SKIP_BUILD=true` for a fast restart that reuses the previous build.

## Not done yet

- Hero imagery. The slots are wired: upload to a project or post's `heroImage`
  and `src/components/hero-image.tsx` renders it through `next/image`. Until
  one lands, each falls back to the design's 45° hatch with the intended
  subject spelled out.
- Social links, seeded into the Settings global, point at plausible handles;
  confirm them in the admin. They also feed the `sameAs` in the Organization
  JSON-LD, so a wrong one is wrong in two places.
- The roster ships empty on purpose — no invented students. Add people under
  Members; each needs a role, and a photo is optional (the card falls back to
  an initials monogram).
- Contact submissions are stored, not delivered. Nobody is notified, so either
  someone checks Forms → Submissions or this needs an email hook.
- Media uploads go to the local filesystem. Fine on a VPS or a container with a
  volume; on an ephemeral disk they vanish on deploy. One
  `@payloadcms/storage-*` adapter in `src/collections/Media.ts` fixes it.
- No tests. `slugify` and the revalidation tag fan-out are the two things that
  would most benefit.
- Recruitment shares `/contact` with sponsorship and press. For a student lab
  "join us" is likely the primary conversion and may deserve its own page.
