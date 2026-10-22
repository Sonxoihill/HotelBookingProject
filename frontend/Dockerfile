# ==========================================
# Stage 1: Build React/Vite SPA bundle
# ==========================================
FROM node:20-alpine AS build
WORKDIR /app

# Khai báo build ARG cho Vite (API Base URL)
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files để tận dụng Docker layer caching
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm ci

# Copy toàn bộ mã nguồn frontend
COPY . .

# Build static bundle ra thư mục /app/dist
RUN npm run build

# ==========================================
# Stage 2: Serve với Nginx
# ==========================================
FROM nginx:1.27-alpine

# Copy file cấu hình Nginx tùy chỉnh (SPA routing + Reverse Proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production bundle từ Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 cho Web Server Nginx
EXPOSE 80

# Chạy Nginx foreground
CMD ["nginx", "-g", "daemon off;"]
