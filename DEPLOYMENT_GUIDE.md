# Deployment Guide: CodeOps Platform
## Backend (Render) + Frontend (Vercel)

---

## 📋 **Prerequisites**

Before deploying, make sure you have:

- ✅ GitHub account
- ✅ Render account ([render.com](https://render.com/))
- ✅ Vercel account ([vercel.com](https://vercel.com/))
- ✅ MongoDB Atlas account (for database)
- ✅ Redis Cloud account (optional, for caching)
- ✅ Cloudinary account (for video uploads)

---

## 🚀 **Part 1: Deploy Backend to Render**

### **Step 1: Prepare Your Backend**

1. **Ensure your backend has the correct structure**:
   ```
   backend/
   ├── src/
   │   ├── index.js
   │   ├── config/
   │   ├── controllers/
   │   ├── models/
   │   ├── routes/
   │   └── ...
   ├── package.json
   ├── .env.example
   └── .gitignore
   ```

2. **Make sure `.gitignore` excludes**:
   ```
   node_modules/
   .env
   .env.local
   ```

### **Step 2: Push Code to GitHub**

1. **Initialize git (if not already done)**:
   ```bash
   git init
   git add .
   git commit -m "Prepare for deployment"
   ```

2. **Create a GitHub repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name: `codeops-platform`
   - Make it **Private** (recommended)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/codeops-platform.git
   git branch -M main
   git push -u origin main
   ```

### **Step 3: Setup MongoDB Atlas**

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. **Create a free cluster**:
   - Sign in/Sign up
   - Click "Build a Database"
   - Choose **FREE** tier (M0)
   - Select a region close to you
   - Click "Create"

3. **Configure Database Access**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `codeops-admin` (or any name you prefer)
   - Password: Generate a secure password (save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `codeops` (or your preferred database name)
   
   Example:
   ```
   mongodb+srv://codeops-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/codeops?retryWrites=true&w=majority
   ```

### **Step 4: Setup Redis (Optional but Recommended)**

1. **Go to [Redis Cloud](https://redis.com/try-free/)**
2. **Create a free database**:
   - Sign up
   - Click "Create database"
   - Choose **Free** plan
   - Select same region as your app
   - Click "Create"

3. **Get Redis credentials**:
   - Copy the **Endpoint** (host:port)
   - Copy the **Password**

   Example:
   ```
   Host: redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com
   Port: 12345
   Password: your_redis_password
   ```

### **Step 5: Deploy to Render**

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Select "Build and deploy from a Git repository"
   - Click "Next"

3. **Connect GitHub Repository**:
   - Click "Connect GitHub"
   - Authorize Render
   - Select your `codeops-platform` repository
   - Click "Connect"

4. **Configure Web Service**:
   - **Name**: `codeops-backend` (or any name you prefer)
   - **Region**: Choose the region closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: Choose **Free**

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add each of these:

   | Key | Value | Example |
   |-----|-------|---------|
   | `NODE_ENV` | `production` | - |
   | `PORT` | `10000` | - |
   | `MONGO_URI` | Your MongoDB connection string | `mongodb+srv://...` |
   | `JWT_KEY` | Generate a random 32+ char string | `your-super-secret-jwt-key-min-32-chars` |
   | `CLOUD_NAME` | Your Cloudinary cloud name | `dxxxxx` |
   | `API_KEY` | Your Cloudinary API key | `123456789012345` |
   | `API_SECRET` | Your Cloudinary API secret | `xxxxxxxxxxxxxx` |
   | `GROQ_KEY` | Your GROQ API key | `gsk_xxxxxxxxxxxx` |
   | `REDIS_HOST` | Your Redis host | `redis-12345.c123...` |
   | `REDIS_PORT` | Your Redis port | `12345` |
   | `REDIS_PASS` | Your Redis password | `your_redis_password` |
   | `FRONTEND_URL` | Leave blank for now | Will add after Vercel deploy |

6. **Create Web Service**:
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Your backend URL will be: `https://codeops-backend.onrender.com`
   - **Save this URL!** You'll need it for Vercel.

7. **Verify Deployment**:
   - Once deployed, click on the URL
   - You should see your API running (might be a simple message or 404 if no root route)
   - Check logs for any errors

---

## 🎨 **Part 2: Deploy Frontend to Vercel**

### **Step 1: Prepare Frontend for Deployment**

1. **Update your frontend package.json** (already done):
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

2. **Ensure vercel.json is configured** (already done in your repo):
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### **Step 2: Deploy to Vercel**

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your `codeops-platform` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (click "Edit" and select the frontend folder)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://codeops-backend.onrender.com` |

   *(Replace with your actual Render backend URL from Part 1, Step 6)*

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your frontend URL will be: `https://your-project-name.vercel.app`
   - **Save this URL!**

### **Step 3: Update Backend with Frontend URL**

1. **Go back to Render Dashboard**
2. **Open your `codeops-backend` service**
3. **Go to "Environment" tab**
4. **Add/Update Environment Variable**:
   - Key: `FRONTEND_URL`
   - Value: `https://your-project-name.vercel.app` (your Vercel URL)
5. **Click "Save Changes"**
6. **Wait for automatic redeployment** (~2 minutes)

---

## ✅ **Verification & Testing**

### **1. Test Backend**
```bash
# Check if backend is running
curl https://codeops-backend.onrender.com

# Test an API endpoint (adjust based on your routes)
curl https://codeops-backend.onrender.com/api/health
```

### **2. Test Frontend**
- Open `https://your-project-name.vercel.app` in your browser
- Try logging in / signing up
- Test creating/solving problems
- Check browser console for errors

### **3. Check Logs**

**Render Backend Logs**:
- Go to Render Dashboard → Your Service → "Logs" tab
- Monitor for errors

**Vercel Frontend Logs**:
- Go to Vercel Dashboard → Your Project → "Deployments" → Click latest → "Functions" or "Logs"

---

## 🔧 **Troubleshooting**

### **Backend Issues**

**Problem: "Module not found" errors**
```bash
# Solution: Ensure package.json has all dependencies
cd backend
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Problem: Database connection fails**
- Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Verify connection string has correct password
- Ensure database name exists in connection string

**Problem: CORS errors**
- Verify `FRONTEND_URL` environment variable is set correctly in Render
- Check that backend CORS configuration includes your Vercel URL

### **Frontend Issues**

**Problem: "Failed to fetch" or API errors**
- Verify `VITE_API_URL` is set correctly in Vercel
- Check that backend is running (visit backend URL)
- Open browser DevTools → Network tab to see failed requests

**Problem: Blank page after deployment**
- Check Vercel build logs for errors
- Verify `build` command succeeded
- Check that `dist` folder is generated

### **Environment Variables Not Working**

**Render:**
- Must redeploy after adding/changing variables
- Check spelling exactly matches your code

**Vercel:**
- Variables starting with `VITE_` are exposed to client
- Must redeploy after adding/changing variables

---

## 🔄 **Updating Your App**

### **To Deploy Updates:**

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

- **Render**: Auto-deploys on push (5-10 min)
- **Vercel**: Auto-deploys on push (2-3 min)

### **To Rollback:**

**Render:**
- Dashboard → Your Service → "Manual Deploy" → Select previous commit

**Vercel:**
- Dashboard → Deployments → Find previous deployment → "⋯" → "Promote to Production"

---

## 🎉 **You're Done!**

Your app should now be live at:
- **Frontend**: https://your-project-name.vercel.app
- **Backend**: https://codeops-backend.onrender.com

### **Optional Enhancements:**

1. **Custom Domain** (Vercel):
   - Vercel Dashboard → Your Project → "Settings" → "Domains"
   - Add your custom domain

2. **Environment-Specific URLs**:
   - Set up staging/production environments
   - Vercel automatically creates preview URLs for PRs

3. **Monitoring**:
   - Enable Render metrics
   - Use Vercel Analytics

4. **Performance**:
   - Enable Redis caching
   - Optimize build settings
   - Use CDN for static assets

---

## 📞 **Need Help?**

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/

---

## 🔐 **Security Checklist**

- ✅ `.env` files are in `.gitignore`
- ✅ JWT secret is strong (32+ characters)
- ✅ MongoDB network access is configured
- ✅ CORS is configured with specific origins
- ✅ All sensitive data is in environment variables
- ✅ HTTPS is enabled (automatic on Render/Vercel)

---

**Good luck with your deployment! 🚀**
