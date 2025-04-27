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
COPY client/package*.json client/
COPY admin/package*.json admin/

# Install Node.js dependencies
RUN npm install --prefix server \
    && npm install --prefix client \
    && npm install --prefix admin

# Copy full application
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r python_rec/requirements.txt

# Make Python scripts executable
RUN chmod +x python_rec/*.py

# Expose server port
EXPOSE 3000

# Default command: start Node server
CMD ["npm", "run", "start", "--prefix", "server"]