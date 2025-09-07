# SaveMyRyde Deployment Guide

This guide provides comprehensive instructions for deploying the SaveMyRyde application to different hosting providers.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
   - [Netlify (Frontend)](#netlify-frontend)
   - [Firebase Hosting (Frontend)](#firebase-hosting-frontend)
   - [Railway (Backend)](#railway-backend)
   - [Render (Backend)](#render-backend)
   - [Digital Ocean App Platform (Full Stack)](#digital-ocean-app-platform-full-stack)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Continuous Integration/Deployment](#continuous-integrationdeployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying SaveMyRyde, ensure you have:

- Node.js v18+ and npm installed
- Git installed
- Docker (optional, for local testing)
- GitHub account (for CI/CD)
- Access to a PostgreSQL database (for production)
- Access to a Redis instance (for production)

## Deployment Options

### Netlify (Frontend)

Netlify is a great free option for hosting the frontend application.

1. **Build the frontend for production**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. **Or deploy using Netlify UI**:
   - Go to [Netlify](https://app.netlify.com/)
   - Sign up or log in
   - Drag and drop the `frontend/dist` directory
   - Configure your site settings

4. **Set up environment variables**:
   - Go to Site settings > Build & deploy > Environment
   - Add the `VITE_API_URL` variable pointing to your backend URL

5. **Configure redirects**:
   - Netlify will use the `netlify.toml` file at the root of the `frontend` directory
   - This handles SPA routing and API proxying

### Firebase Hosting (Frontend)

Firebase Hosting is another free option for the frontend.

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Log in to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done):
   ```bash
   firebase init hosting
   ```
   - Select "Use an existing project" and choose your Firebase project
   - Set the public directory to `frontend/dist`
   - Configure as a single-page app
   - Don't overwrite `index.html`

4. **Deploy to Firebase**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Railway (Backend)

Railway offers a user-friendly platform for deploying backend services with a generous free tier.

1. **Sign up** at [Railway](https://railway.app/)

2. **Install Railway CLI** (optional):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

3. **Create a new project** in Railway dashboard

4. **Add services**:
   - Add a PostgreSQL database
   - Add a Redis instance
   - Add a service from GitHub repo

5. **Configure the backend service**:
   - Set the start command to `npm start`
   - Add all required environment variables (see [Environment Variables](#environment-variables))
   - Connect the PostgreSQL and Redis services

6. **Deploy**:
   ```bash
   railway up
   ```

### Render (Backend)

Render is another excellent platform with a free tier suitable for the backend.

1. **Sign up** at [Render](https://render.com/)

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Select the backend directory
   - Set the build command to `npm install && npm run build`
   - Set the start command to `npm start`
   - Select the appropriate environment (Node)

3. **Add environment variables** in the Render dashboard

4. **Create a PostgreSQL database** in Render

5. **Link the database** to your web service

### Digital Ocean App Platform (Full Stack)

For a more integrated approach, Digital Ocean App Platform can host both frontend and backend.

1. **Sign up** at [Digital Ocean](https://www.digitalocean.com/)

2. **Create a new App**:
   - Connect your GitHub repository
   - Configure the frontend component:
     - Set the source directory to `frontend`
     - Set the build command to `npm ci && npm run build`
     - Set the output directory to `dist`
     - Configure environment variables
   - Configure the backend component:
     - Set the source directory to `backend`
     - Set the build command to `npm ci && npm run build`
     - Set the run command to `npm start`
     - Configure environment variables
   - Add a database cluster

3. **Deploy** your application through the DO dashboard

## Database Setup

For production, you'll need a PostgreSQL database. Options include:

- **Managed services**: Railway, Render, Digital Ocean, AWS RDS, etc.
- **Self-hosted**: Your own server with PostgreSQL installed

Once you have a database:

1. **Get connection details** (host, port, username, password, database name)

2. **Update environment variables** with connection details

3. **Run database migrations**:
   ```bash
   # Connect to your production database and apply the schema
   psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f backend/src/db/schema.sql
   
   # Or through the backend
   NODE_ENV=production npm run db:apply
   ```

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the backend directory with these variables:

```env
# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.com

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Redis
REDIS_URL=redis://your-redis-url:6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Admin JWT (Optional, defaults to JWT_SECRET)
ADMIN_JWT_SECRET=your-admin-jwt-secret

# Email (SMTP)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_EMAIL=no-reply@savemyryde.co.ke

# Default Admin (for first-time setup)
DEFAULT_ADMIN_EMAIL=admin@savemyryde.co.ke
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=https://your-backend-url.com
```

## Continuous Integration/Deployment

The repository includes GitHub Actions workflows for CI/CD.

1. **Set up GitHub repository secrets**:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify authentication token
   - `NETLIFY_SITE_ID`: Your Netlify site ID
   - `DOCKER_HUB_USERNAME`: Your Docker Hub username
   - `DOCKER_HUB_TOKEN`: Your Docker Hub token
   - Any additional secrets for your deployment platform

2. **Enable GitHub Actions** in your repository

3. **Push to main branch** to trigger the workflow

The CI/CD pipeline will:
- Run tests
- Build the application
- Deploy the frontend to Netlify
- Build and push backend Docker image
- Deploy to your chosen backend platform (with additional configuration)

## Post-Deployment Verification

After deployment, verify that everything is working:

1. **Check frontend**:
   - Visit your deployed frontend URL
   - Verify that all pages load correctly
   - Test user signup/login
   - Test creating a listing

2. **Check backend**:
   - Visit `https://your-backend-url.com/api`
   - Verify that the API responds with a status message
   - Check logs for any errors

3. **Test admin panel**:
   - Visit `https://your-frontend-url.com/admin/login`
   - Log in with the default admin credentials
   - Verify that all admin functions work correctly

## Troubleshooting

### Frontend Issues

- **Blank page**: Check for JavaScript errors in the console
- **API connection errors**: Verify the `VITE_API_URL` environment variable
- **404 errors on refresh**: Ensure redirects are properly configured

### Backend Issues

- **Database connection errors**: Verify database credentials and network access
- **Redis connection errors**: Check Redis URL and network access
- **Email sending failures**: Verify SMTP credentials

### Common Solutions

- **Clear browser cache** after frontend updates
- **Restart backend service** after configuration changes
- **Check logs** in your hosting platform dashboard
- **Verify environment variables** are correctly set
- **Ensure database migrations** have been applied

For further assistance, please open an issue on the GitHub repository.