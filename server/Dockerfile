FROM node:18.17.1-alpine

WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3001

CMD npm start