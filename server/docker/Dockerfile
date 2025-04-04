# Use Node.js 18 LTS as the base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the application port (adjust this to match your app's port)
EXPOSE 300

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "dist/index.js"]