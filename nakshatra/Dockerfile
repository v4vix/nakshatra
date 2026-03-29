# ─── Nakshatra Full-Stack Dockerfile ──────────────────────────────────────────
# Single container: Node.js backend serves both API + built frontend static files

# Stage 1: Build frontend
FROM node:22-bookworm AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:22-bookworm AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --no-audit --no-fund

COPY backend/ ./
RUN npx tsc

# Stage 3: Production runtime
FROM node:22-bookworm AS production
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

# Copy backend dist + package files
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package*.json ./

# Install only production deps
RUN npm install --no-audit --no-fund --omit=dev

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./public

# Create non-root user (Debian style)
RUN groupadd -g 1001 nakshatra \
 && useradd -r -u 1001 -g nakshatra -d /app -s /usr/sbin/nologin nakshatra \
 && chown -R nakshatra:nakshatra /app

USER nakshatra

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:${PORT:-3001}/health || exit 1

CMD ["node", "dist/index.js"]