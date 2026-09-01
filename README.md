# Pulse FX

MVP para acompanhar **câmbio (BRL)** e **indicadores macroeconômicos** a partir de fontes públicas (BCB e FRED), com dados persistidos, API própria e cliente web.

> **Disclaimer:** conteúdo **educacional**. Este produto **não constitui recomendação de investimento**.

---

## Stack

| Área            | Tecnologia                    |
| --------------- | ----------------------------- |
| Frontend        | React + TypeScript (Next.js)  |
| Backend         | Node.js + TypeScript (NestJS) |
| Banco de dados  | PostgreSQL                    |
| Containerização | Docker + Docker Compose       |

## Estrutura do monorepo

```
pulse-fx/
├── apps/
│   ├── api/   → Backend NestJS
│   └── web/   → Frontend Next.js
├── packages/
│   └── shared/   → Código compartilhado entre api e web
└── docker-compose.yml
```

---

## Como rodar localmente (sem Docker, por enquanto)

```bash
npm install
npm run dev:api   # http://localhost:3000
npm run dev:web   # http://localhost:3000 (ajustar porta se rodar os dois juntos)
```

## PostgreSQL via Docker Compose

```bash
cp .env.example .env
docker compose up -d postgres
```

## Como rodar os testes e o lint

```bash
npm run test
npm run lint
```
