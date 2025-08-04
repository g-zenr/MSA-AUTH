# Multi-stage Dockerfile for high-performance Node.js LMS API application
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY webpack.config.js ./

# Install dependencies with retry mechanism for network issues
RUN npm ci --only=production --no-audit --no-fund --network-timeout=100000 --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY webpack.config.js ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --no-audit --no-fund --network-timeout=100000 --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY app/ ./app/
COPY config/ ./config/
COPY helper/ ./helper/
COPY middleware/ ./middleware/
COPY utils/ ./utils/
COPY zod/ ./zod/
COPY prisma/ ./prisma/
COPY docs/ ./docs/
COPY assets/ ./assets/
COPY index.ts ./

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript with webpack
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner

# Install system dependencies for Prisma
RUN apk add --no-cache libc6-compat openssl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/assets ./assets

# Set ownership to non-root user
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/server.ts"] 