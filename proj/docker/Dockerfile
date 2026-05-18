# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter api build

# Stage 2: produção — imagem mínima, usuário não-root
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/apps/api/package.json ./package.json
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder /app/apps/api/dist ./dist
USER appuser
EXPOSE 3000
# Secrets injetados em runtime — nunca como ARG ou ENV no Dockerfile
CMD ["node", "dist/main.js"]
