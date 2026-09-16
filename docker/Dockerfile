# syntax=docker/dockerfile:1

# Thin runnable wrapper around the published npm package.
#
# The install stage runs natively on the build host (the package and its
# dependencies are pure JavaScript, so node_modules is architecture-independent)
# and the result is copied into a per-platform runtime image. Build with:
#
#   docker build --build-arg PACKAGE_VERSION=2.5.0 -t tiktok-live-connector docker/
ARG NODE_IMAGE=node:24-alpine

FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS deps
ARG PACKAGE_VERSION
RUN test -n "$PACKAGE_VERSION" || { echo "PACKAGE_VERSION build-arg is required (e.g. 2.5.0)" >&2; exit 1; }
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund --no-package-lock "tiktok-live-connector@${PACKAGE_VERSION}"

FROM ${NODE_IMAGE}
ARG PACKAGE_VERSION
LABEL org.opencontainers.image.title="tiktok-live-connector" \
      org.opencontainers.image.description="Streams TikTok LIVE chat, gift, like and viewer events as JSON lines" \
      org.opencontainers.image.source="https://github.com/zerodytrash/TikTok-Live-Connector" \
      org.opencontainers.image.url="https://github.com/zerodytrash/TikTok-Live-Connector" \
      org.opencontainers.image.licenses="AGPL-3.0-only" \
      org.opencontainers.image.version="${PACKAGE_VERSION}"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY entrypoint.mjs ./entrypoint.mjs
USER node
ENTRYPOINT ["node", "entrypoint.mjs"]
