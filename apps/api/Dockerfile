# Build a partir da raiz do monorepo:
#   docker build -f apps/api/Dockerfile .

FROM node:20-alpine
WORKDIR /repo

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api

RUN npm ci

WORKDIR /repo/apps/api
RUN npx prisma generate

WORKDIR /repo
RUN npm run build --workspace apps/api

WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main"]
