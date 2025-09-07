# Backend Dockerfile (Debian-based to avoid Alpine vips issues)
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Build tools for native modules (sharp) - prebuilt binaries are used, but keep toolchain for fallbacks
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* .npmrc* ./

# Install full deps for build (includes devDependencies)
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src
COPY public ./public

# Build TypeScript -> dist
RUN npm run build

# Runtime image
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy package manifests and install production deps only
COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json* ./
RUN npm ci --omit=dev \
    && rm -rf /root/.npm

# Copy built app and public assets
COPY --from=base /app/dist ./dist
COPY --from=base /app/public ./public

# Create uploads directory
RUN mkdir -p /app/uploads
VOLUME ["/app/uploads"]

# Expose port
EXPOSE 3001

# Default command
CMD ["node", "dist/index.js"]