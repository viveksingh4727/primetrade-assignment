FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ARG DATABASE_URL="postgresql://neondb_owner:npg_DBsoAzY6uy7Z@ep-still-queen-aqpw3gqa-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "server.js"]
