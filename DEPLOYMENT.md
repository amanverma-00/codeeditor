# Deployment Guide

## Render Backend Deployment

### Prerequisites

- GitHub repository connected to Render
- MongoDB Atlas database
- Redis Cloud instance
- Required API keys (Judge0, Groq, Cloudinary)

### Steps

1. **Connect Repository to Render**

   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Render Service**

   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Node Version:** 18+ (set in Environment Variables)

3. **Environment Variables (Add in Render Dashboard)**

   ```
   NODE_ENV=production
   PORT=(automatically set by Render)
   DB_CONNECT_STRING=mongodb+srv://your-connection-string
   JWT_KEY=your-jwt-secret-key
   REDIS_PASS=your-redis-password
   FRONTEND_URL=https://your-vercel-app.vercel.app
   JUDGE0_KEY=your-judge0-api-key
   GROQ_KEY=your-groq-api-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Database Setup**

   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0
   - Or add Render's IP ranges to whitelist

5. **Deploy**
   - Push changes to GitHub
   - Render will automatically build and deploy

## Vercel Frontend Deployment

### Steps

1. **Connect Repository to Vercel**

   - Go to Vercel Dashboard
   - Import your GitHub repository

2. **Configure Vercel Project**

   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Environment Variables (Add in Vercel Dashboard)**

   ```
   VITE_API_URL=https://your-render-app.onrender.com
   ```

4. **Deploy**
   - Push changes to GitHub
   - Vercel will automatically build and deploy

## Post-Deployment

1. **Update Backend CORS**

   - Update `FRONTEND_URL` in Render environment variables
   - Set it to your Vercel deployment URL

2. **Test API Connection**
   - Verify frontend can communicate with backend
   - Test authentication flow
   - Test problem submission

## Troubleshooting

- **CORS Issues:** Ensure `FRONTEND_URL` is correctly set in backend
- **Database Connection:** Check MongoDB Atlas network access settings
- **Redis Connection:** Verify Redis credentials and network access
- **API Keys:** Ensure all external API keys are valid and have proper permissions

## Local Development Commands

```bash
# Install all dependencies
npm run install:all

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build frontend for production
npm run build:frontend
```
