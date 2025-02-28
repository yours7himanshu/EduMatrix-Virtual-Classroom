FROM node:20

WORKDIR /server
WORKDIR /client
WORKDIR /admin

COPY . .

RUN npm install