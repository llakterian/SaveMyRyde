# Frontend Dockerfile (Vite build -> static)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./
# Basic nginx config for SPAs + proxy API and uploads to backend
COPY <<'NGINX_CONF' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root   /usr/share/nginx/html;
  index  index.html index.htm;

  location / {
    try_files $uri /index.html;
  }

  # Proxy API calls to backend
  location /api/ {
    proxy_pass http://backend:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Proxy guarded uploads (images) to backend media route
  location /uploads/ {
    proxy_pass http://backend:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
NGINX_CONF
EXPOSE 80