@echo off
echo Starting Docker development environment...
docker-compose up -d

echo Opening shell in container...
docker exec -it finance-dashboard-dev /bin/sh

echo To exit the shell, type 'exit'
echo To stop the container, run 'docker-compose down' 