# Step-by-Step Guide: Commit and Push Changes to GitHub

## 📋 Changes Summary
This commit adds **Email OTP Verification** for user registration:
- OTP-based email verification system
- Resend OTP functionality
- New VerifyOTP page in frontend
- Updated authentication flow
- Redis client connection handling fixes

---

## 🚀 Step-by-Step Instructions

### Step 1: Check Current Status
```bash
git status
```
This will show all modified and new files.

---

### Step 2: Review Your Changes (Optional)
```bash
git diff
```
Review what has changed in your existing files.

---

### Step 3: Stage All Changes
```bash
git add .
```
Or stage specific files:
```bash
# Backend changes
git add backend/src/middleware/userMiddleware.js
git add backend/src/middleware/rateLimitor.js
git add backend/src/config/redis.js

# Frontend changes
git add frontend/src/pages/VerifyOTP.jsx
git add frontend/src/authSlice.js
git add frontend/src/pages/Signup.jsx
git add frontend/src/pages/Login.jsx
git add frontend/src/App.jsx

# Documentation
git add README.md
```

---

### Step 4: Verify Staged Files
```bash
git status
```
Make sure all the files you want to commit are listed under "Changes to be committed".

---

### Step 5: Commit Your Changes
```bash
git commit -m "feat: Add email OTP verification for user registration

- Implement OTP-based email verification system
- Add VerifyOTP page with 6-digit code input
- Add resend OTP functionality with 60s cooldown
- Update authSlice with verifyOTP and resendOTP actions
- Update Signup flow to redirect to OTP verification
- Update Login to handle unverified users
- Fix Redis client connection checks in middleware
- Update README with email verification documentation"
```

---

### Step 6: Pull Latest Changes (Important!)
```bash
git pull origin main
```
Or if your branch is named differently:
```bash
git pull origin master
```

**Note:** If there are conflicts, you'll need to resolve them before pushing.

---

### Step 7: Push to GitHub
```bash
git push origin main
```
Or:
```bash
git push origin master
```

---

## 🔍 Alternative: Interactive Staging

If you want to review each change before staging:

```bash
# Stage files interactively
git add -p

# Or use a GUI
git gui
```

---

## 📝 Quick Commands Cheat Sheet

```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Your commit message"

# Pull latest
git pull origin main

# Push changes
git push origin main

# View commit history
git log --oneline

# View remote URL
git remote -v
```

---

## ⚠️ Troubleshooting

### If push is rejected:
```bash
# Pull with rebase
git pull --rebase origin main

# Then push
git push origin main
```

### If you need to unstage files:
```bash
# Unstage all
git reset

# Unstage specific file
git reset HEAD filename
```

### If you made a mistake in commit message:
```bash
# Amend last commit
git commit --amend -m "New commit message"
```

---

## ✅ Verification

After pushing, verify your changes on GitHub:
1. Go to your repository on GitHub
2. Check the latest commit
3. Review the files changed
4. Verify commit message appears correctly

---

## 🎯 Files Changed in This Commit

### Backend:
- `backend/src/middleware/userMiddleware.js` - Added Redis connection check
- `backend/src/middleware/rateLimitor.js` - Added Redis connection check

### Frontend:
- `frontend/src/pages/VerifyOTP.jsx` - NEW: OTP verification page
- `frontend/src/authSlice.js` - Added OTP actions and reducers
- `frontend/src/pages/Signup.jsx` - Updated to redirect to OTP page
- `frontend/src/pages/Login.jsx` - Handle unverified user login
- `frontend/src/App.jsx` - Added VerifyOTP route

### Documentation:
- `README.md` - Updated with OTP verification details

---

## 📌 Remember

- Always pull before you push to avoid conflicts
- Write clear, descriptive commit messages
- Test your changes before committing
- Use meaningful branch names for features

---

Good luck! 🚀
