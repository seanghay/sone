FROM node:22-alpine

RUN apk update && apk add --update --no-cache fontconfig-dev fontconfig ttf-dejavu

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .

CMD [ "node", "main.js" ]