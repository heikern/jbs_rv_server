# Use the official Node.js image (change version if necessary)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./

# Install dependencies using pnpm instead of npm
RUN apk add --no-cache git \
    && npm install -g pnpm \
    && pnpm install

# Copy the rest of your application
COPY . .

# Install rimraf globally for the clean script in the build step
RUN npm install -g rimraf typescript

# Build the TypeScript project (ensure "build" is defined in package.json to compile TS to JS)
RUN pnpm run build

# Set the environment variable for PORT
ENV PORT=8080

# Define the startup command using the compiled JavaScript
CMD ["node", "build/index.js"]

# Note: When running Docker on WSL, the commands remain unchanged.
