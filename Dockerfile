# ── Estágio 1: instalação e build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# Compila seed.ts → JS para rodar sem ts-node em produção
RUN npx tsc --module commonjs --target ES2020 --esModuleInterop true \
    --skipLibCheck true --moduleResolution node \
    --outDir dist-seed --rootDir prisma prisma/seed.ts

# ── Estágio 2: dependências de produção ─────────────────────────────────────
FROM node:20-alpine AS deps-prod

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

# ── Estágio 3: imagem final ──────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# OpenSSL necessário para o Prisma Client no Alpine
RUN apk add --no-cache openssl libc6-compat

# Usuário não-root para segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup --from=deps-prod /app/node_modules ./node_modules
COPY --chown=appuser:appgroup --from=builder   /app/dist         ./dist
COPY --chown=appuser:appgroup --from=deps-prod /app/prisma       ./prisma
COPY --chown=appuser:appgroup --from=builder   /app/dist-seed/seed.js ./prisma/seed.js
COPY --chown=appuser:appgroup --from=builder   /app/package*.json ./

USER appuser

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node dist/main.js"]
