FROM node:22-alpine

WORKDIR /app

# Copy built frontend artifacts
COPY frontend/dist ./frontend/dist

# Copy backend package files
COPY backend/package.json ./backend/package.json
COPY backend/package-lock.json ./backend/package-lock.json

# Copy built backend artifacts
COPY backend/dist ./backend/dist

# Install production dependencies for backend
WORKDIR /app/backend
RUN npm ci --production



# Set environment variables
ENV NODE_ENV=production

# Set working directory to backend and start the application
WORKDIR /app/backend
