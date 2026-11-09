FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS dependencies
COPY package*.json ./
RUN npm install --no-audit --no-fund

FROM dependencies AS build
COPY . .
# Prisma 7 reads DATABASE_URL from prisma.config.ts even during client generation.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./package.json
EXPOSE 4000
CMD ["sh", "-c", "npm run db:deploy && npm run db:seed && npm start"]
