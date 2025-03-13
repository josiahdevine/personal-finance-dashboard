#!/bin/bash

# Run the build process in the Docker container
echo "Running build process in Docker container..."
docker exec -it finance-dashboard-dev npm run build

# Display any errors
if [ $? -ne 0 ]; then
  echo "Build failed. Check the error messages above."
else
  echo "Build completed successfully. Your app is ready for deployment."
fi 