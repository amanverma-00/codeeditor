# Environment Variables Configuration

## 🔑 Required Environment Variables

### **Render Backend** (Production)

Add these in Render Dashboard → Your Service → Environment:

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# Database (MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority

# Authentication
JWT_KEY=your-super-secret-jwt-key-minimum-32-characters-long

# Frontend URL (Add after Vercel deployment)
FRONTEND_URL=https://your-frontend-app.vercel.app

# === OPTIONAL (based on features used) ===

# Redis Cache
REDIS_HOST=redis-xxxxx.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASS=your_redis_password

# Cloudinary (Video Uploads)
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# AI Features (GROQ)
GROQ_KEY=gsk_your_groq_api_key

# Email Service
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_specific_password

# Code Execution (Judge0 - if using)
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key
```

---

### **Vercel Frontend** (Production)

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
# Backend API URL (from Render)
VITE_API_URL=https://your-backend-app.onrender.com
```

---

## 🔗 Where to Get Each Value

### **MONGO_URI**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Database → Connect → Connect your application
3. Copy connection string
4. Replace `<password>` and `<dbname>`

**Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/codeops?retryWrites=true&w=majority
```

---

### **JWT_KEY**
Generate a secure random string (minimum 32 characters).

**Option 1** - Using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2** - Using Online Generator:
- Visit: https://generate-secret.vercel.app/32

---

### **REDIS_HOST, REDIS_PORT, REDIS_PASS**
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create database
3. Copy endpoint (host:port) and password

**Format:**
```bash
REDIS_HOST=redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASS=your_password_here
```

---

### **CLOUD_NAME, API_KEY, API_SECRET**
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up/Login
3. Dashboard → Account Details

**Format:**
```bash
CLOUD_NAME=dxxxxxxx
API_KEY=123456789012345
API_SECRET=xxxxxxxxxxxxxxxxxxxxxxx
```

---

### **GROQ_KEY**
1. Go to [GROQ Console](https://console.groq.com/)
2. Sign up/Login
3. API Keys → Create API Key

**Format:**
```bash
GROQ_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **EMAIL_USER, EMAIL_PASS**
For Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app-specific password
4. Use that password (not your regular Gmail password)

**Format:**
```bash
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # App-specific password (16 characters)
```

---

### **JUDGE0_URL, JUDGE0_API_KEY**
1. Go to [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Subscribe to free tier
3. Copy API key from dashboard

**Format:**
```bash
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
```

---

## ⚙️ How to Add Environment Variables

### **On Render:**
1. Go to https://dashboard.render.com
2. Select your service
3. Click "Environment" in left sidebar
4. Click "Add Environment Variable"
5. Enter Key and Value
6. Click "Save Changes"
7. Wait for automatic redeployment

### **On Vercel:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Enter Key and Value
5. Select "Production" (and optionally Preview/Development)
6. Click "Save"
7. Redeploy: Deployments → Latest → "⋯" → "Redeploy"

---

## 🔒 Security Best Practices

- ✅ **Never** commit `.env` files to Git
- ✅ Keep `.env.example` updated (without real values)
- ✅ Use strong, random JWT keys (32+ characters)
- ✅ Use app-specific passwords for email
- ✅ Rotate keys periodically
- ✅ Use different keys for development and production

---

## 🧪 Testing Environment Variables

### **Test Backend:**
Create a test endpoint to verify variables (remove after testing):

```javascript
// backend/src/routes/test.js
router.get('/env-test', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwtKey: !!process.env.JWT_KEY,
    hasFrontendUrl: !!process.env.FRONTEND_URL,
    // Add more checks as needed
  });
});
```

### **Test Frontend:**
Add this temporarily in a component:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

---

## 📋 Environment Variable Template

Use this template when setting up:

```bash
# === REQUIRED ===
NODE_ENV=production
PORT=10000
MONGO_URI=
JWT_KEY=
FRONTEND_URL=

# === OPTIONAL (uncomment and fill if needed) ===
# REDIS_HOST=
# REDIS_PORT=
# REDIS_PASS=
# CLOUD_NAME=
# API_KEY=
# API_SECRET=
# GROQ_KEY=
# EMAIL_USER=
# EMAIL_PASS=
# JUDGE0_URL=
# JUDGE0_API_KEY=
```

---

**Need help?** Check the main deployment guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
