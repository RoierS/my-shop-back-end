# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app 

COPY package*.json ./

RUN npm install
RUN npm install @nestjs/cli

COPY . .

RUN chmod +x ./node_modules/.bin/nest
RUN npx nest build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 4444

CMD ["node", "dist/main"]

