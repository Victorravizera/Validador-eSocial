# eSocial QA Validator

Plataforma SaaS de validação automatizada de eventos trabalhistas do eSocial,
com API REST, integração CI/CD e suporte multi-tenant.

## Estrutura do Monorepo

```
esocial-qa/
├── apps/
│   └── api/                  # API Fastify (Node.js + TypeScript)
├── packages/
│   ├── sdk/                  # SDK cliente (@esocial-qa/sdk)
│   └── rules/                # Regras de validação compartilhadas
├── docker/                   # Dockerfiles e compose
├── docs/                     # Documentação técnica
└── scripts/                  # Scripts de automação
```

## Pré-requisitos

- Node.js >= 20
- Docker e Docker Compose
- pnpm >= 9

## Setup local

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir infraestrutura (Postgres + Redis)
docker compose -f docker/compose.dev.yml up -d

# 3. Copiar e preencher variáveis de ambiente
cp apps/api/.env.example apps/api/.env

# 4. Rodar migrations
pnpm --filter api db:migrate

# 5. Iniciar em modo desenvolvimento
pnpm --filter api dev
```

## Testes

```bash
# Unitários
pnpm --filter api test

# Com cobertura
pnpm --filter api test:coverage

# Integration
pnpm --filter api test:integration
```

## Documentação da API

Com o servidor rodando, acesse: http://localhost:3000/docs

## Segurança

- Nenhuma secret deve ser commitada. Use `.env` (ignorado pelo git).
- Veja `apps/api/.env.example` para todas as variáveis necessárias.
- Rotacione `JWT_SECRET` e `API_KEY_SALT` antes de ir para produção.
