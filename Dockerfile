FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Install dependencies (including dev for prisma + build)
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy source code
COPY . .

# Generate Prisma client from schema
RUN npx prisma generate

# Build Next.js application
RUN npm run build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Startup: push schema to DB (creates tables if missing), then start app
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run start"]
