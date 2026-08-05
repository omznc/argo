#!/bin/sh
set -e

# Startup sequence for the container. The ordering is the whole point.
#
# The site is prerendered from the CMS: `next build` runs `payload.find()` for
# every project and post and bakes the results into static HTML. That means the
# build has to see the real database — which lives on a volume and therefore
# does not exist when the image is built. So the build happens here, at start,
# after the volume is mounted and the migrations have run.
#
# It costs about 30 seconds on boot and is why the image keeps its dev
# dependencies. In exchange, a container always serves content that matches its
# database, with no step that can be forgotten. `NEXT_PUBLIC_*` variables are
# inlined at build time, so building here is also what lets compose set the
# canonical site URL without rebuilding the image.

echo "==> Migrating database"
bun run migrate

# Always, but only into a collection that has no documents at all.
#
# This is load-bearing, not a nicety: under Cache Components every
# `generateStaticParams` must return at least one result, so `next build` fails
# against an empty collection — a fresh database would never get past the build
# below. Seeding an empty collection is what makes the first deploy work. Once
# an editor has written anything this is a no-op, so a deliberately deleted
# project does not come back.
echo "==> Seeding empty collections"
bun run seed --if-empty

# Opt-in, and different: rewrites every seeded slug whether or not it is there.
if [ "${ARGO_SEED}" = "true" ]; then
  echo "==> Seeding all content (ARGO_SEED=true)"
  bun run seed
fi

# Skippable for a fast restart when neither the source nor the content changed.
if [ "${ARGO_SKIP_BUILD}" = "true" ] && [ -f .next/BUILD_ID ]; then
  echo "==> Skipping build (ARGO_SKIP_BUILD=true, existing build found)"
else
  echo "==> Building site from CMS content"
  bun run build
fi

echo "==> Starting Next.js on ${HOSTNAME}:${PORT}"
exec bun run start --hostname "${HOSTNAME}" --port "${PORT}"
