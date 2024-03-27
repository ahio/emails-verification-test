FROM node:18.17.1-alpine

WORKDIR /app
COPY ./app /app

RUN npm install

EXPOSE 3000

ENTRYPOINT ["npm", "start"]