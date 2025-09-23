FROM node:20-alpine as development

WORKDIR /app

RUN apk update && apk add --no-cache postgresql-client

COPY package.json ./
COPY package-lock.json ./
COPY yarn.lock ./

RUN npm install --include=dev

COPY prisma ./prisma/


RUN npx prisma generate


COPY wait-for-db.sh ./

RUN chmod +x wait-for-db.sh

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["./wait-for-db.sh", "postgres", "npm", "run", "start:dev"]