# Pulse FX

MVP para acompanhar **câmbio (BRL)** e **indicadores macroeconômicos** a partir de fontes públicas (BCB e FRED), com dados persistidos, API própria e cliente web.

> **Disclaimer:** conteúdo **educacional**. Este produto **não constitui recomendação de investimento**.

---

## Stack

| Área            | Tecnologia                    |
| --------------- | ----------------------------- |
| Frontend        | React + TypeScript (Next.js)  |
| Backend         | Node.js + TypeScript (NestJS) |
| Banco de dados  | PostgreSQL (Prisma)           |
| Containerização | Docker + Docker Compose       |

## Estrutura do monorepo

```
pulse-fx/
├── apps/
│   ├── api/   → Backend NestJS (ver apps/api/README.md para detalhes da arquitetura interna)
│   └── web/   → Frontend Next.js
├── packages/
│   └── shared/   → Código compartilhado entre api e web
└── docker-compose.yml
```

---

## Como subir o ambiente (Docker Compose)

```bash
cp .env.example .env
# preencher FRED_API_KEY — https://fredaccount.stlouisfed.org/apikeys

docker compose up --build
```

- API: http://localhost:3001
- Postgres: localhost:5432

O container da API roda migration + seed automaticamente antes de subir (`prisma migrate deploy && prisma db seed && node dist/src/main`) — não precisa de nenhum passo manual além de preencher o `.env`.

O usuário inicial (único, sem cadastro pela API) é criado pelo seed: username `paul`, senha `thomson`, role `ADMIN`.

## Variáveis de ambiente

Ver `.env.example` na raiz para a lista completa com valores de exemplo. Resumo:

| Variável                                       | Descrição                                                    |
| ----------------------------------------------- | -------------------------------------------------------------- |
| `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` | credenciais do Postgres (usadas pelo container e pela API)    |
| `DATABASE_URL`                                  | connection string completa (montada automaticamente pra API dentro do compose) |
| `JWT_SECRET`                                    | assinatura dos tokens de login                                 |
| `API_KEY`                                       | acesso alternativo aos endpoints admin (`/indicators/sync/*`), sem precisar de login |
| `SEED_ADMIN_NAME`/`SEED_ADMIN_USERNAME`/`SEED_ADMIN_PASSWORD` | usuário criado pelo seed                       |
| `BCB_BASE_URL`                                  | base da API PTAX do BCB (sem default — precisa estar setada)  |
| `FRED_BASE_URL`/`FRED_API_KEY`                  | base e chave da API do FRED — registrar em https://fredaccount.stlouisfed.org/apikeys |
| `FX_SYNC_TTL_MINUTES`/`MACRO_SYNC_TTL_MINUTES`  | política de sincronização (ver abaixo) — opcionais, com default |
| `SYNC_ON_STARTUP`                               | dispara um sync real (BCB e FRED) assim que a API sobe, pra já existir dado no banco no primeiro acesso — opcional, default `true` no compose |

## Séries escolhidas

Conjunto coerente ligado por um fio condutor: câmbio BRL e os dois fatores macro que mais o influenciam.

**USD/BRL — PTAX (BCB), diário.** Taxa de câmbio de fechamento oficial usada em contratos e balanços no Brasil. É o núcleo do produto.

**EUR/BRL — PTAX (BCB), diário.** Segunda moeda de referência, usa o mesmo mecanismo de publicação do BCB (`CotacaoMoedaPeriodo`), ampliando a cobertura sem custo de integração adicional.

**FEDFUNDS — Federal Funds Rate (FRED), mensal.** Taxa básica de juros dos EUA. O diferencial de juros entre EUA e Brasil é um dos principais motores de fluxo de capital e, portanto, do USD/BRL.

**CPIAUCSL — US CPI (FRED), mensal.** Inflação americana influencia diretamente as decisões do Fed sobre juros (FEDFUNDS), que por sua vez afetam o dólar globalmente — fecha a narrativa câmbio → juro → inflação que move o juro.

Documentação oficial: [BCB Olinda/PTAX](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3/), [FRED API](https://fred.stlouisfed.org/docs/api/fred/).

## Regras de variação percentual e janela de histórico

Implementadas em `VariationCalculatorService` (`apps/api/src/application/indicator/domain/service/`), usadas de forma idêntica no dashboard e na tela de detalhe (mesma regra, mesmo serviço).

- **Último valor** = observação mais recente persistida.
- **Data de referência** = data da observação, não a hora da consulta/sincronização.
- **Variação %** compara a última observação com a **1ª observação anterior disponível na série persistida** — para séries diárias (FX) e mensais (macro) igualmente. Não conta dias de calendário: como BCB e FRED só publicam em dias úteis/uma vez por mês, "a observação anterior disponível" já é a comparação correta (dia útil anterior / mês anterior), sem precisar de calendário de feriados nem interpolação (que o próprio requisito desaconselha para dados financeiros).
- **Janela de histórico exibida no detalhe** (`GET /indicators/:code`): 30 observações para séries `DAILY`, 13 para séries `MONTHLY` — o suficiente para mostrar tendência recente sem expor todo o histórico já sincronizado.
- **Janela de sincronização** (o que é buscado nas fontes externas a cada sync): incremental — a partir da última observação já persistida (`MAX(date)`) até hoje. Só na primeira sincronização de um indicador, sem nenhuma observação ainda, é usada uma janela inicial fixa (30 dias corridos para FX, ~400 dias para macro, com margem para a defasagem de publicação do FRED).

## Política de sincronização

Ver detalhes em `apps/api/README.md`. Resumo: TTL por indicador (evita chamadas repetidas às APIs externas) + job agendado (cron por tipo de série — hora em hora para FX, diário para macro, casando com a cadência real de publicação de cada fonte) + sync automático ao subir a API (`SYNC_ON_STARTUP=true`, respeitando o TTL) pra já existir dado real no banco no primeiro acesso, sem depender do primeiro tick do cron + endpoints admin (`POST /indicators/sync/fx`, `POST /indicators/sync/macro`, protegidos por JWT ou `x-api-key`) para forçar sob demanda. Os indicadores em si não são seedados: o catálogo é criado pelo próprio sync (`upsertCatalogEntry`), já que ele é quem também marca o timestamp usado pelo TTL.

## Decisões técnicas e trade-offs

- **Arquitetura em camadas sem DDD tático completo:** ports (contratos) → repository/usecase (implementações) → controller (fino). Objetos de domínio (`Indicator`, `Observation`, `User`) são interfaces simples, não classes — só viram entidade com comportamento se houver um invariante real para proteger, o que não é o caso aqui. A única lógica de domínio de verdade (regra de variação %, política de TTL) fica em `domain/service/`.
- **Auth sem cadastro:** o MVP nasce com um único usuário via seed (sem e-mail, só `username`/`password`/`role`); não há endpoint de criação de usuário pela API.
- **Guard combinado (JWT ou `x-api-key`) só para rotas admin de sync** — os endpoints de favoritos exigem JWT de verdade (não aceitam `x-api-key`), já que a identidade sintética da API key não corresponde a um usuário real no banco.
- **Migrations com SQL versionado via Prisma** (`prisma migrate`), não `db push` — histórico auditável.
- **Dockerfile único-estágio para a API** (sem multi-stage otimizado): prioriza simplicidade e confiabilidade de build sobre tamanho de imagem, adequado ao escopo de um MVP de alguns dias.

## Como rodar o frontend web

`apps/web` ainda é o scaffold padrão do `create-next-app`, sem telas implementadas.

```bash
npm install
npm run dev:web   # http://localhost:3000
```

## Como rodar localmente sem Docker (apps/api)

Ver `apps/api/README.md` para o passo a passo completo (env vars, migrations, seed).

## Como rodar os testes e o lint

```bash
npm run test
npm run lint
```

Ver `apps/api/README.md` para detalhes dos testes e2e (banco Postgres temporário criado/apagado a cada execução).
