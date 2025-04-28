FROM node:23-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json tsconfig.json ./

ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=8192

RUN npm ci

# COPY src/ ./src
# RUN npm run build

COPY dist/ ./dist
COPY src/assets/ ./src/assets/

ENTRYPOINT [ "npm", "run", "start:prod" ]
