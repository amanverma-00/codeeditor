# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### **Backend (Render)**
- [ ] GitHub repository created and code pushed
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string copied
- [ ] Redis Cloud instance created (optional)
- [ ] Cloudinary account setup (for video uploads)
- [ ] GROQ API key obtained (for AI features)
- [ ] `.env.example` reviewed for required variables

### **Frontend (Vercel)**
- [ ] Backend deployed and URL obtained
- [ ] `VITE_API_URL` environment variable ready

---

## 🚀 Deployment Steps (Quick Reference)

### **1. MongoDB Setup (5 min)**
1. Go to mongodb.com/cloud/atlas
2. Create FREE cluster
3. Add database user
4. Whitelist all IPs (0.0.0.0/0)
5. Copy connection string

### **2. Deploy Backend to Render (10 min)**
1. Go to dashboard.render.com
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `node src/index.js`
5. Add environment variables (see DEPLOYMENT_GUIDE.md)
6. Deploy
7. **Copy backend URL** → `https://your-app.onrender.com`

### **3. Deploy Frontend to Vercel (5 min)**
1. Go to vercel.com/dashboard
2. Import Git Repository
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
5. Deploy
6. **Copy frontend URL** → `https://your-app.vercel.app`

### **4. Update Backend with Frontend URL (2 min)**
1. Go back to Render dashboard
2. Your Service → Environment
3. Add: `FRONTEND_URL` = your Vercel URL
4. Save (auto-redeploys)

---

## 🧪 Testing

- [ ] Visit frontend URL
- [ ] Try signup/login
- [ ] Test main features
- [ ] Check browser console (no CORS errors)
- [ ] Check Render logs (no errors)

---

## 📝 Important URLs

After deployment, save these:

```
Backend (Render):  https://_____________________.onrender.com
Frontend (Vercel): https://_____________________.vercel.app

MongoDB Atlas:     https://cloud.mongodb.com
Render Dashboard:  https://dashboard.render.com
Vercel Dashboard:  https://vercel.com/dashboard
```

---

## ⏱️ Estimated Time
- **Total**: 20-30 minutes
- Backend setup: 15 min
- Frontend setup: 5 min
- Testing: 5-10 min

---

## 🆘 Common Issues

**CORS Error?**
→ Check `FRONTEND_URL` in Render matches Vercel URL exactly

**Database Connection Failed?**
→ Verify MongoDB IP whitelist is 0.0.0.0/0

**Environment Variables Not Working?**
→ Redeploy after adding/changing variables

**Render Free Tier Spins Down?**
→ First request after inactivity takes 30-50 seconds

---

For detailed instructions, see **DEPLOYMENT_GUIDE.md**
