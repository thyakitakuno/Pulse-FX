# Build a partir da raiz do monorepo:
#   docker build -f apps/web/Dockerfile .

FROM node:20-alpine
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/shared packages/shared
COPY apps/web apps/web

RUN npm ci

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build --workspace apps/web

WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["npm", "start"]
