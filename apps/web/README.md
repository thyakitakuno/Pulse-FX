# Pulse FX — Web

Frontend do Pulse FX: Next.js (App Router) + TypeScript, consumindo a API em `apps/api` via `fetch`.

## Stack

- Next.js + React + TypeScript
- CSS puro (sem framework de estilos)
- Token JWT guardado no `localStorage` do navegador

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx        → RequireAuth + header + Disclaimer, compartilhado por todas as telas logadas
│   │   └── dashboard/page.tsx
│   ├── layout.tsx
│   └── page.tsx               → redireciona para /dashboard
│
├── features/
│   └── auth/
│       ├── services/
│       │   └── auth.service.ts  → chamadas à API do domínio (ex.: login)
│       └── components/
│           ├── LoginForm.tsx
│           └── RequireAuth.tsx  → guarda de rota: sem token, redireciona para /login
│
├── components/
│   ├── layout/
│   │   └── LogoutButton.tsx
│   └── common/
│       └── Disclaimer.tsx
│
├── lib/
│   ├── api/client.ts          → cliente fetch (base URL, header de autorização)
│   └── auth/token.ts          → leitura/escrita do token no localStorage
│
└── styles/
    └── globals.css
```

Grupos de rota (`(auth)`, `(dashboard)`) não aparecem na URL — servem só para dar um layout próprio a cada conjunto de telas sem duplicar código. `features/` guarda componentes e chamadas de API específicos de um domínio (hoje só `auth`; cada domínio novo ganha seu próprio `services/<domínio>.service.ts` — função simples, não classe); `components/` guarda peças genéricas reaproveitadas entre domínios.

## Variáveis de ambiente

```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Opcional — cai em `http://localhost:3001` se ausente (porta da API quando ela roda via `docker compose`).

## Como rodar

```bash
# na raiz do monorepo, com a API já rodando (docker compose up -d postgres api)
npm run dev --workspace apps/web
```

Acesse `http://localhost:3000`. A rota `/` redireciona para `/dashboard`, que exige login — sem token, cai em `/login`.

## Testes e lint

```bash
npm run lint --workspace apps/web
npm run build --workspace apps/web
```
