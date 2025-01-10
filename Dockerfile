# ---- Base Node ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++ git
RUN mkdir -p uploads && chown -R node:node /app

# ---- Dependencies ----
FROM base AS dependencies
COPY package*.json ./

# 전역 패키지를 먼저 설치하고 node_modules 디렉토리 생성
RUN npm install -g ts-patch typia typescript@latest && \
    mkdir -p /app/node_modules && \
    chown -R node:node /app

# node 사용자로 전환
USER node

# 프로젝트 의존성 설치 전에 필요한 패키지들 먼저 설치
RUN npm install --no-save @nestjs/common @nestjs/core @nestjs/cqrs rxjs uuid && \
    npm install --legacy-peer-deps --force

# ---- Development ----
FROM dependencies AS development
COPY --chown=node:node . .
CMD ["npm", "run", "start"]

# ---- Build ----
FROM dependencies AS build
COPY --chown=node:node . .
RUN npm run build

# ---- Production ----
FROM base AS production
# Copy all node_modules (including dev dependencies)
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
# Copy built application
COPY --chown=node:node --from=build /app/dist ./dist
# Copy configuration files
COPY --chown=node:node --from=build /app/ormconfig.js ./

USER node
ENV NODE_ENV production
EXPOSE 3000

CMD ["node", "dist/main.js"]
