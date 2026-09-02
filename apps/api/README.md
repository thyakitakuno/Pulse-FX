# Pulse FX — API

Backend do Pulse FX: NestJS + TypeScript, PostgreSQL via Prisma. Autenticação, catálogo de indicadores, sincronização com fontes públicas (BCB, FRED) e cálculo de variação percentual.

## Stack

- Node.js + TypeScript + NestJS
- PostgreSQL + Prisma (schema, migrations, seed)
- JWT (`@nestjs/jwt` + Passport) e header `x-api-key` para rotas administrativas
- Jest (unitários e e2e)

## Estrutura do projeto

```
src/
├── application/
│   ├── auth/
│   │   ├── domain/entity/       → User (interface; sem invariante a proteger, só reconstrução a partir do banco)
│   │   ├── dto/request|response → validação de entrada (class-validator) e forma de saída
│   │   ├── enums/                → UserRole
│   │   ├── ports/in               → contrato do use case (LoginInPort)
│   │   ├── ports/out              → contrato do repositório (UserRepositoryOutPort)
│   │   ├── repository/           → implementação Prisma do port out
│   │   ├── strategies/            → JwtStrategy (Passport)
│   │   ├── usecase/              → LoginUseCase
│   │   ├── auth.controller.ts
│   │   └── auth.module.ts
│   └── indicator/
│       ├── config/                → catálogo de indicadores por fonte (ex.: fx-indicators.config.ts)
│       ├── domain/entity/        → Indicator, Observation (interfaces)
│       ├── domain/service/       → VariationCalculatorService, SyncPolicyService
│       ├── dto/response/
│       ├── enums/                 → IndicatorSource, IndicatorFrequency
│       ├── ports/in               → GetDashboardInPort, SyncFxRatesInPort, SyncMacroIndicatorsInPort
│       ├── ports/out              → IndicatorRepositoryOutPort, BcbClientOutPort, FredClientOutPort
│       ├── repository/           → implementação Prisma
│       ├── scheduler/            → IndicatorSyncScheduler (job de hora em hora)
│       ├── usecase/              → GetDashboardUseCase, SyncFxRatesUseCase, SyncMacroIndicatorsUseCase
│       ├── indicator.controller.ts
│       └── indicator.module.ts
├── common/
│   └── guards/
│       └── auth.guard.ts         → aceita JWT (Bearer) ou header x-api-key
├── infra/
│   ├── clients/
│   │   ├── bcb.client.ts         → integração com a API PTAX (Olinda/BCB)
│   │   └── fred.client.ts        → integração com a API do FRED (fred/series/observations)
│   └── persistence/
│       ├── prisma.service.ts
│       └── prisma.module.ts
├── app.module.ts
└── main.ts

prisma/
├── schema.prisma
├── migrations/
└── seed.ts                        → cria o usuário inicial (Paul Julius Reuter, role ADMIN)

test/
├── auth/login.e2e-spec.ts
├── global-setup.ts                → cria um banco Postgres temporário (nome aleatório) por execução
├── global-teardown.ts             → apaga o banco temporário ao final
└── helpers/
```

Cada domínio segue o mesmo formato: `ports` (contratos) → `repository`/`usecase` (implementações) → `controller` (fino, só delega). Objetos de domínio são interfaces simples — só viram classe com comportamento próprio se houver um invariante real para proteger (não é o caso aqui até agora).

## Variáveis de ambiente

Copiar `.env.test` como referência de quais variáveis existem, ou ver `.env.example` na raiz do monorepo. Para desenvolvimento local, criar `apps/api/.env` com:

```
DATABASE_URL="postgresql://pulsefx:pulsefx@localhost:5432/pulsefx?schema=public"
JWT_SECRET="..."
API_KEY="..."
SEED_ADMIN_NAME="Paul Julius Reuter"
SEED_ADMIN_USERNAME="paul"
SEED_ADMIN_PASSWORD="..."
BCB_BASE_URL="https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata"
FRED_BASE_URL="https://api.stlouisfed.org/fred"
FRED_API_KEY="..."
FX_SYNC_TTL_MINUTES="60"
MACRO_SYNC_TTL_MINUTES="1440"
```

As duas últimas são opcionais — caem nos defaults acima se ausentes.

`FRED_API_KEY` precisa ser registrada em https://fredaccount.stlouisfed.org/apikeys.

`DATABASE_URL` aqui aponta para `localhost` porque os comandos abaixo rodam no host, fora do container — dentro do `docker-compose`, o hostname do Postgres é `postgres`.

## Como rodar

```bash
# na raiz do monorepo
cp .env.example .env
docker compose up -d postgres

# dentro de apps/api
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

npm run start:dev
```

## Política de sincronização

- **TTL:** cada sync verifica quando o indicador foi sincronizado pela última vez (`Indicator.updatedAt`) antes de chamar BCB/FRED. Se estiver dentro do TTL, pula a chamada externa (`status: "skipped"` na resposta). TTL configurável via `FX_SYNC_TTL_MINUTES` (default 60) e `MACRO_SYNC_TTL_MINUTES` (default 1440).
- **Job agendado:** `IndicatorSyncScheduler` tem um cron por tipo de série, casando com a frequência de cada uma — FX de hora em hora (`EVERY_HOUR`), macro uma vez por dia (`EVERY_DAY_AT_MIDNIGHT`).
- **Endpoint admin:** `POST /indicators/sync/fx` e `POST /indicators/sync/macro`, protegidos por `AuthGuard`, para forçar sync sob demanda (útil pra teste/debug — mesmo assim respeitam o TTL).

## Endpoints

| Método | Rota                  | Auth               | Descrição                                                                          |
| ------ | --------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| POST   | `/auth/login`         | pública            | Autentica por `username`/`password`, retorna `accessToken` (JWT, expira em 1 dia). |
| GET    | `/indicators`         | pública            | Dashboard: nome, último valor, data de referência e variação % de cada indicador.  |
| POST   | `/indicators/sync/fx` | JWT ou `x-api-key` | Sincroniza USD-BRL e EUR-BRL a partir do BCB (PTAX, últimos 30 dias, idempotente). |
| POST   | `/indicators/sync/macro` | JWT ou `x-api-key` | Sincroniza FEDFUNDS e CPIAUCSL a partir do FRED (últimos ~13 meses, idempotente). |

## Testes

```bash
npm run test        # unitários
npm run test:e2e     # e2e — cria um banco Postgres temporário por execução e apaga ao final
npm run lint
```

Os testes e2e precisam do Postgres do `docker-compose` rodando (`docker compose up -d postgres`); o resto (banco de teste, migration, seed) é provisionado automaticamente pelo `global-setup.ts`.
