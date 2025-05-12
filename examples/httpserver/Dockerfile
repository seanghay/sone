FROM node:22-alpine

RUN apk update && apk add --update --no-cache \
    bash curl git python3 perl build-base g++ linux-headers \
    musl-dev openssl-dev fontconfig-dev fontconfig ttf-dejavu

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .

CMD [ "node", "main.js" ]