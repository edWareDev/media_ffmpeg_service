FROM node:22-alpine AS build

ARG BUILD_SCRIPT=build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run ${BUILD_SCRIPT}

FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /app
ARG DIST_DIR=dist

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/${DIST_DIR} ./dist

RUN mkdir -p /app/tmp && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/app.js"]
