FROM node:18.17.1-alpine

WORKDIR /usr/src/app
COPY ./app/package.json ./app/package-lock.json ./
RUN npm ci
COPY ./app .

EXPOSE 3000

ENTRYPOINT ["npm", "start"]