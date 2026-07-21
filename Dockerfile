# Stage 1: Build the React + Vite application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy source code
COPY . .

# Build production static bundle in /app/dist
RUN npm run build

# Stage 2: Serve application with Nginx (Optimized for Easypanel / Cloud containers)
FROM nginx:alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
