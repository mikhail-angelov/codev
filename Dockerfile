FROM node:22-alpine

WORKDIR /app

COPY package.json ./package.json
COPY backend/package.json ./package.json
COPY backend/package-lock.json ./package-lock.json
COPY backend/dist ./backend/dist

RUN cd backend && \
    npm install --production

COPY frontend/dist ./frontend/dist
