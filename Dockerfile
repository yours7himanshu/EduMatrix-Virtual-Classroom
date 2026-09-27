# syntax=docker/dockerfile:1
FROM python:3.11-slim

# Install Node.js 20
RUN apt-get update && apt-get install -y curl build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Node.js package manifests
COPY server/package*.json server/

# Install Node.js dependencies
RUN npm ci --prefix server --omit=dev

# Copy full application
COPY server server
COPY python_rec python_rec

# Install Python dependencies
RUN pip install --no-cache-dir -r python_rec/requirements.txt

# Make Python scripts executable
RUN chmod +x python_rec/*.py

# Expose server port
EXPOSE 5000 8080
ENV PORT=5000
ENV WS_PORT=8080
ENV NODE_ENV=production

# Default command: start Node server
CMD ["npm", "run", "start", "--prefix", "server"]