#!/bin/bash

# Start the Docker development environment
echo "Starting Docker development environment..."
docker-compose up -d

# Open a shell into the container
echo "Opening shell in container..."
docker exec -it finance-dashboard-dev /bin/sh

# To exit the shell, type 'exit'
# To stop the container, run 'docker-compose down' 