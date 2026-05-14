FROM node:22-slim AS deps
WORKDIR /app
COPY src/services/control_agent/package*.json ./
RUN npm ci

FROM deps AS build
COPY src/services/control_agent/ ./
RUN npm run build

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY src/services/control_agent/package*.json ./
EXPOSE 8080
CMD ["node", "dist/main.js"]
