# ─── Nakshatra Full-Stack Dockerfile ──────────────────────────────────────────
# Single container: Node.js backend serves both API + built frontend static files
# Suitable for Render, Fly.io, Railway, or any Docker-based PaaS

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

# Copy backend dist + deps
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package*.json ./
RUN npm install --no-audit --no-fund --omit=dev

# Copy built frontend into public/ (served as static files)
COPY --from=frontend-build /app/frontend/dist ./public

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3001}/health || exit 1

# Non-root user for security
RUN addgroup -g 1001 -S nakshatra && adduser -S nakshatra -u 1001
USER nakshatra

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
