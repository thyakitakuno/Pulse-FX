# Pulse FX — Web

Frontend do Pulse FX: Next.js (App Router) + TypeScript, consumindo a API em `apps/api` via `fetch`.

## Stack

- Next.js + React + TypeScript
- Tailwind CSS v4 (utilitário, via `@tailwindcss/postcss`)
- Sessão via cookie `httpOnly` setado pela API — sem token acessível a JavaScript

## Estrutura do projeto

```
src/
├── proxy.ts                   → checa a sessão no servidor antes de servir rotas protegidas
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx        → header/nav + Disclaimer, compartilhado por todas as telas logadas
│   │   ├── dashboard/page.tsx
│   │   ├── favorites/page.tsx    → "Meus indicadores"
│   │   └── indicators/[code]/page.tsx
│   ├── layout.tsx
│   └── page.tsx               → redireciona para /dashboard
│
├── features/
│   ├── auth/
│   │   ├── services/
│   │   │   └── auth.service.ts  → login/logout
│   │   └── components/
│   │       └── LoginForm.tsx
│   ├── dashboard/
│   │   ├── services/
│   │   │   └── dashboard.service.ts  → GET /indicators
│   │   └── components/
│   │       ├── DashboardGrid.tsx     → busca os dados, cuida de loading/erro
│   │       └── IndicatorCard.tsx     → card de um indicador (link para o detalhe)
│   ├── indicator/
│   │   ├── services/
│   │   │   └── indicator.service.ts  → GET /indicators/:code
│   │   └── components/
│   │       └── IndicatorDetailView.tsx  → resumo + histórico em tabela + limitações
│   └── favorites/
│       ├── services/
│       │   └── favorites.service.ts  → GET/POST/DELETE /favorites
│       └── components/
│           ├── FavoriteButton.tsx    → estrela de favoritar, usada no card e no detalhe
│           └── FavoritesGrid.tsx     → grade de "Meus indicadores"
│
├── components/
│   ├── layout/
│   │   ├── LogoutButton.tsx
│   │   └── Nav.tsx              → navegação Dashboard / Meus indicadores no header
│   └── common/
│       ├── Card.tsx             → cartão base (com/sem link, hover interativo opcional), usado no dashboard e no detalhe
│       ├── VariationBadge.tsx   → selo colorido de variação % (verde/vermelho/neutro)
│       ├── VariationBadge.test.tsx
│       ├── Spinner.tsx          → indicador de carregamento, usado nas buscas à API
│       └── Disclaimer.tsx
│
├── lib/
│   ├── api/client.ts          → cliente fetch (base URL, `credentials: 'include'`, redireciona pro login em 401)
│   ├── format.ts              → formatação de valor/data/variação, compartilhada entre dashboard e detalhe
│   └── format.test.ts
│
└── styles/
    └── globals.css
```

Grupos de rota (`(auth)`, `(dashboard)`) não aparecem na URL — servem só para dar um layout próprio a cada conjunto de telas sem duplicar código. `features/` guarda componentes e chamadas de API específicos de um domínio; `components/` guarda peças genéricas reaproveitadas entre domínios.

**Autenticação:** não existe guarda de rota no cliente nem token em `localStorage`. `POST /auth/login` seta um cookie `httpOnly` (inacessível a JavaScript); `src/proxy.ts` (Next.js Middleware, renomeado pra "Proxy" a partir do Next 16) checa a presença desse cookie **no servidor**, antes de qualquer página protegida carregar — redireciona pra `/login` sem sessão, e de `/login` pra `/dashboard` com sessão ativa. Isso evita qualquer descompasso entre o que o servidor renderiza e o que o navegador mostra no primeiro instante (problema real que apareceu com a abordagem anterior via `localStorage` + guarda no cliente). Se uma chamada autenticada à API voltar `401` (sessão expirada/inválida), `apiFetch` redireciona pro login automaticamente.

## Variáveis de ambiente

```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Opcional — cai em `http://localhost:3001` se ausente (porta da API quando ela roda via `docker compose`).

## Como rodar

### Via Docker (junto com o resto do stack)

```bash
# na raiz do monorepo
docker compose up --build
```

### Sem Docker (host, com a API já rodando)

```bash
# na raiz do monorepo
docker compose up -d postgres api
npm run dev --workspace apps/web
```

Acesse `http://localhost:3000`. A rota `/` redireciona para `/dashboard`, que exige sessão — sem cookie válido, cai em `/login`.

`NEXT_PUBLIC_API_URL` é lido em **build time** pelo Next.js (fica embutido no bundle do navegador), não em runtime — por isso, no `docker compose`, ele é passado como build arg (`args:` no serviço `web`), não como variável de ambiente do container.

## Testes e lint

```bash
npm run lint --workspace apps/web
npm run test --workspace apps/web
npm run build --workspace apps/web
```

Jest + React Testing Library (`jest.config.js`, via `next/jest`). O `moduleNameMapper` força `react`/`react-dom` a resolverem sempre pra cópia de dentro de `apps/web/node_modules` — sem isso, o `prisma` (via `@prisma/studio-core`, dependência do comando `prisma studio`) puxa uma cópia de React 18 pra raiz do monorepo, que colide com o React 19 do Next e quebra a renderização nos testes ("Objects are not valid as a React child").
