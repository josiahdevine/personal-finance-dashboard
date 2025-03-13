FROM node:20-alpine

WORKDIR /app

# Install git for potential operations
RUN apk add --no-cache git

# Install dependencies only when needed
COPY package.json package-lock.json* ./
RUN npm install

# Install global dev dependencies
RUN npm install -g nodemon 

# Set environment to development
ENV NODE_ENV=development

# Expose port 3000 for React development server
EXPOSE 3000

# Keep the container running
CMD ["sh", "-c", "echo 'Development environment is ready. You can run your commands now.' && tail -f /dev/null"] 