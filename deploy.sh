#!/bin/bash

# Script to commit changes, push to GitHub, and deploy to Netlify

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Personal Finance Dashboard Deployment ===${NC}"
echo -e "${YELLOW}This script will commit your changes, push to GitHub, and deploy to Netlify${NC}"
echo ""

# 1. Add all changes to git
echo -e "${GREEN}[1/5] Adding all changes to git...${NC}"
git add .

# 2. Commit the changes
echo -e "${GREEN}[2/5] Committing changes...${NC}"
echo -e "${YELLOW}Enter a commit message (e.g., 'Add Stripe integration and mobile optimization'):${NC}"
read commit_message

if [ -z "$commit_message" ]; then
  commit_message="Update dashboard with Stripe integration and mobile optimization"
  echo -e "${YELLOW}Using default commit message: $commit_message${NC}"
fi

git commit -m "$commit_message"

# 3. Push to GitHub
echo -e "${GREEN}[3/5] Pushing to GitHub...${NC}"
git push origin main || git push origin master

# 4. Check if netlify-cli is installed
echo -e "${GREEN}[4/5] Checking Netlify CLI...${NC}"
if ! command -v netlify &> /dev/null; then
  echo -e "${YELLOW}Netlify CLI not found. Installing...${NC}"
  npm install -g netlify-cli
fi

# 5. Deploy to Netlify
echo -e "${GREEN}[5/5] Deploying to Netlify...${NC}"
echo -e "${YELLOW}Choose an option:${NC}"
echo "1. Deploy with Netlify CLI (requires authentication)"
echo "2. Skip Netlify deployment (manual deploy from Netlify dashboard)"
read -p "Option (1 or 2): " deploy_option

if [ "$deploy_option" == "1" ]; then
  # Check if user is logged in to Netlify
  if ! netlify status &> /dev/null; then
    echo -e "${YELLOW}Logging in to Netlify...${NC}"
    netlify login
  fi
  
  # Deploy to Netlify
  echo -e "${YELLOW}Deploying to Netlify...${NC}"
  netlify deploy --prod
else
  echo -e "${YELLOW}Skipping Netlify deployment.${NC}"
  echo -e "${YELLOW}Please deploy manually from the Netlify dashboard:${NC}"
  echo "1. Go to app.netlify.com"
  echo "2. Select your site"
  echo "3. Deploy manually or wait for automatic deployment if configured"
fi

echo ""
echo -e "${GREEN}=== Deployment process completed ===${NC}"
echo -e "${YELLOW}Don't forget to check the NEXT_STEPS.md file for future tasks!${NC}" 