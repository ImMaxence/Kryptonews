# syntax=docker/dockerfile:1

# ── Dependencies (npm only exists in this stage) ────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# ── Runtime ─────────────────────────────────────────────────────
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app

# The runtime never calls npm/yarn: removing them drops their bundled
# dependencies (and their CVEs) from the image.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
      /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health > /dev/null || exit 1

CMD ["node", "src/index.js"]
