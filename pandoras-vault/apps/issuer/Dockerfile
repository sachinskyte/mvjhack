# Dockerfile for Issuer Backend
#
# Purpose: Containerize the Node.js issuer API
#
# Contains:
# - Node.js base image
# - Dependency installation
# - Prisma generation
# - Build steps
# - Production runtime
#
# Multi-stage build:
#
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
#
# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
#
# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
EXPOSE 8080
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
#
# Build:
# docker build -t pandoras-vault-issuer .
# docker run -p 3001:8080 --env-file .env pandoras-vault-issuer
