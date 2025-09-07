#!/bin/bash

# SaveMyRyde Deployment Preparation Script
# This script prepares deployment packages for various hosting providers

set -e

# Check if script is run from the project root
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "Error: This script must be run from the project root directory"
  exit 1
fi

# Create deployment directory if it doesn't exist
mkdir -p deployment

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== SaveMyRyde Deployment Preparation ===${NC}"
echo "This script will prepare deployment packages for various hosting platforms."

# Build frontend
echo -e "\n${YELLOW}Building frontend...${NC}"
cd frontend
npm ci
npm run build
cd ..
echo -e "${GREEN}✓ Frontend build completed${NC}"

# Build backend
echo -e "\n${YELLOW}Building backend...${NC}"
cd backend
npm ci
npm run build
cd ..
echo -e "${GREEN}✓ Backend build completed${NC}"

# Prepare Netlify deployment
echo -e "\n${YELLOW}Preparing Netlify package...${NC}"
mkdir -p deployment/netlify
cp -r frontend/dist/* deployment/netlify/
cp frontend/netlify.toml deployment/netlify/
cd deployment
zip -r savemyryde-netlify.zip netlify
cd ..
echo -e "${GREEN}✓ Netlify package created at deployment/savemyryde-netlify.zip${NC}"

# Prepare Firebase deployment
echo -e "\n${YELLOW}Preparing Firebase package...${NC}"
mkdir -p deployment/firebase
cp -r frontend/dist/* deployment/firebase/
cp firebase.json .firebaserc deployment/firebase/
cd deployment
zip -r savemyryde-firebase.zip firebase
cd ..
echo -e "${GREEN}✓ Firebase package created at deployment/savemyryde-firebase.zip${NC}"

# Prepare backend for Railway
echo -e "\n${YELLOW}Preparing Railway package...${NC}"
mkdir -p deployment/railway
cp -r backend/dist deployment/railway/
cp backend/package.json backend/package-lock.json deployment/railway/
cp -r backend/public deployment/railway/
cat > deployment/railway/railway.json << EOF
{
  "schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "echo 'Build already completed'"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 10,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
cd deployment
zip -r savemyryde-railway.zip railway
cd ..
echo -e "${GREEN}✓ Railway package created at deployment/savemyryde-railway.zip${NC}"

# Prepare backend for Render
echo -e "\n${YELLOW}Preparing Render package...${NC}"
mkdir -p deployment/render
cp -r backend/dist deployment/render/
cp backend/package.json backend/package-lock.json deployment/render/
cp -r backend/public deployment/render/
cat > deployment/render/render.yaml << EOF
services:
  - type: web
    name: savemyryde-backend
    env: node
    buildCommand: echo 'Build already completed'
    startCommand: node dist/index.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
EOF
cd deployment
zip -r savemyryde-render.zip render
cd ..
echo -e "${GREEN}✓ Render package created at deployment/savemyryde-render.zip${NC}"

# Prepare full-stack for Digital Ocean
echo -e "\n${YELLOW}Preparing Digital Ocean App Platform package...${NC}"
mkdir -p deployment/digitalocean
cp -r frontend deployment/digitalocean/
cp -r backend deployment/digitalocean/
cat > deployment/digitalocean/app.yaml << EOF
name: savemyryde
services:
- name: frontend
  github:
    repo: llakterian/SaveMyRyde
    branch: main
    deploy_on_push: true
  build_command: cd frontend && npm ci && npm run build
  run_command: cd frontend && npm run preview
  http_port: 4173
  routes:
  - path: /
- name: backend
  github:
    repo: llakterian/SaveMyRyde
    branch: main
    deploy_on_push: true
  build_command: cd backend && npm ci && npm run build
  run_command: cd backend && npm start
  http_port: 3001
  routes:
  - path: /api
databases:
- name: savemyryde-db
  engine: PG
  version: "14"
EOF
cd deployment
zip -r savemyryde-digitalocean.zip digitalocean
cd ..
echo -e "${GREEN}✓ Digital Ocean package created at deployment/savemyryde-digitalocean.zip${NC}"

echo -e "\n${GREEN}=== All deployment packages created successfully ===${NC}"
echo -e "You can find the deployment packages in the ${YELLOW}deployment/${NC} directory:"
echo -e "  - ${YELLOW}savemyryde-netlify.zip${NC} - For Netlify hosting (frontend)"
echo -e "  - ${YELLOW}savemyryde-firebase.zip${NC} - For Firebase hosting (frontend)"
echo -e "  - ${YELLOW}savemyryde-railway.zip${NC} - For Railway hosting (backend)"
echo -e "  - ${YELLOW}savemyryde-render.zip${NC} - For Render hosting (backend)"
echo -e "  - ${YELLOW}savemyryde-digitalocean.zip${NC} - For Digital Ocean App Platform (full-stack)"
echo -e "\nRefer to DEPLOYMENT.md for detailed deployment instructions."
