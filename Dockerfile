# Build stage
FROM node:16 AS build

WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final stage
FROM node:16

WORKDIR /app
COPY --from=build /build/package*.json ./
RUN npm ci --production
COPY --from=build /build/dist ./dist
COPY --from=build /build/config.json ./

CMD ["node", "dist/index.js"]
