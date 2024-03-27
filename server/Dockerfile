FROM node:18.17.1-alpine

WORKDIR /app
COPY . /app

RUN npm install

EXPOSE 3001

ENTRYPOINT ["npm", "start"]