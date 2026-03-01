FROM node:20-alpine

ARG PORT=3002

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT}

CMD ["npm", "start"]
