FROM ghcr.io/puppeteer/puppeteer:24.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

USER root

RUN apt-get update && apt-get install -y chromium

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npm", "run", "dev"]
