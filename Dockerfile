# syntax=docker/dockerfile:1

# Node, not Bun, is the runtime: the `next` binary is `#!/usr/bin/env node`, and
# Next 16 is only supported on Node. Bun is copied in because it is what the
# project's scripts and lockfile expect — it installs and runs scripts, Node
# runs the server.
#
# Debian rather than Alpine so sharp resolves its glibc prebuilt
# (@img/sharp-linux-x64) instead of compiling libvips from source.
FROM node:22-bookworm-slim

# `canary` because bun.lock is lockfileVersion 2, written by Bun 1.4, and the
# published `latest`/`1` images are still on 1.3.14 — which cannot parse it and
# fails a frozen install with "Unknown lockfile version".
#
# Only the binary is copied and it is only used to install and to run scripts,
# so the blast radius is small. Move this to `oven/bun:1` the moment a 1.4
# image is published; the frozen install below is what makes the build
# reproducible and it needs a Bun that can read the lockfile.
COPY --from=oven/bun:canary /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# curl is used by the compose healthcheck; ca-certificates by anything that
# talks TLS (a remote database, a webhook).
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

# Dependencies first, so a source-only change doesn't reinstall them.
# Dev dependencies are kept: the image builds the site at startup (see the
# entrypoint), and `next build` needs TypeScript and Tailwind to do it.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Writable by the `node` user, which owns the volumes mounted over them.
RUN mkdir -p /data /app/media /app/.next \
  && chown -R node:node /app /data

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URI=file:/data/argo.db \
    MEDIA_DIR=/app/media

USER node
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
