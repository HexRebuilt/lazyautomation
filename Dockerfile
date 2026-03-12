# Stage 1: Builder
FROM node:20.11.1-alpine AS builder
ENV PORT=3000
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY public ./public
COPY src ./src
COPY server.cjs ./
COPY index.html ./
COPY vite.config.js ./
COPY package*.json ./

# Build the application
RUN npm run build

# Create health check file
RUN echo "OK" > dist/health

# Stage 2: Runtime
FROM node:20.11.1-alpine
ENV PORT=3000
WORKDIR /app

# Install curl for healthcheck and create user with proper home
RUN apk add --no-cache curl && \
    addgroup -S appgroup && \
    adduser -D appuser -G appgroup -h /app && \
    chown -R appuser:appgroup /app

# Set HOME before any npm operations
ENV HOME=/app

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.cjs ./
COPY --from=builder /app/package*.json ./

# Install production dependencies only (as root, before switching user)
RUN npm install --production --no-cache

# Clean up npm cache before switching to non-root user
RUN rm -rf /app/.npm

# Create a minimal static server setup
RUN mkdir -p /app/public

# Switch to non-root user
USER appuser

# Expose port
EXPOSE ${PORT}

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start with a simple static file server
CMD ["node", "server.cjs"]
