FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ sqlite3 libsqlite3-dev openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci
RUN npm rebuild better-sqlite3

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]