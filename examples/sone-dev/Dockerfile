FROM node:22-alpine

RUN apk update && apk add --update --no-cache fontconfig-dev fontconfig ttf-dejavu font-noto font-noto-emoji font-noto-khmer

RUN fc-cache -f && fc-list | sort 

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY . .

ENV PORT=80
EXPOSE 80
CMD [ "node", "serve.js" ]