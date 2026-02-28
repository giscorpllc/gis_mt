# ─── Stage 1: install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
# ci installs exact versions from package-lock.json — reproducible builds
RUN npm ci

# ─── Stage 2: build the Next.js app ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# MSW is never activated in production builds (NEXT_PUBLIC_ vars are baked in
# at build time, so the dynamic import branch is eliminated by the bundler)
ENV NEXT_PUBLIC_APP_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=""

RUN npm run build

# ─── Stage 3: minimal production runner ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy the standalone server output (includes only what's needed to run)
COPY --from=builder /app/public               ./public
COPY --from=builder --chown=nextjs:nodejs \
     /app/.next/standalone                    ./
COPY --from=builder --chown=nextjs:nodejs \
     /app/.next/static                        ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is emitted by Next.js standalone output
CMD ["node", "server.js"]
