FROM node:18 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application
COPY . .

# Final image
FROM node:18-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built node modules and application files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Set environment variables
ENV NODE_ENV=production

# Create a more robust startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "==== Starting Deployment Process ===="\n\
echo "1. Deploying commands..."\n\
node src/deploy-commands.js\n\
echo "2. Command deployment completed"\n\
echo "3. Starting bot process..."\n\
echo "==== Bot Logs Below ===="\n\
exec node src/index.js\n' > start.sh && \
    chmod +x start.sh

# Use the startup script
CMD ["./start.sh"] 
