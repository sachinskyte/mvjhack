
#
# Purpose: Production-ready Docker image for issuer API
#
# (This is a reference/copy of the Dockerfile in apps/issuer/)
#
# Multi-stage build for optimized image size
#
# Contains:
# - Node.js 18 Alpine base
# - PNPM for dependency management
# - Prisma client generation
# - TypeScript compilation
# - Production runtime with minimal dependencies
#
# Stages:
# 1. deps: Install dependencies
# 2. builder: Build application
# 3. runner: Production runtime
#
# Build command:
# docker build -t pandoras-vault-issuer -f infra/docker/issuer/Dockerfile apps/issuer
#
# Run command:
# docker run -p 3001:8080 --env-file .env pandoras-vault-issuer
#
# Environment variables required:
# - DATABASE_URL
# - BLOCKCHAIN_RPC_URL
# - ISSUER_PRIVATE_KEY
# - PINATA_API_KEY
# - PINATA_SECRET_KEY
#
# Healthcheck:
# - Interval: 30s
# - Timeout: 5s
# - Retries: 3
# - Endpoint: /health
