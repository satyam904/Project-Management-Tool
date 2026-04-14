# Stage 1: Build the React application
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies and build
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build step with an empty VITE_API_URL so it falls back to relative paths '/'
# which Nginx will capture and reverse proxy to the backend.
RUN VITE_API_URL="" npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx config with our custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Nginx runs on 80 by default)
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
