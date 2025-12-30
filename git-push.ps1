# Quick Git Push Script
# Run this from the root directory (E:\codeops)

Write-Host "🚀 CodeOps - Git Commit & Push Helper" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check status
Write-Host "📋 Step 1: Checking git status..." -ForegroundColor Yellow
git status
Write-Host ""

# Pause for review
Write-Host "Press any key to continue with staging files..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 2: Stage all changes
Write-Host "📦 Step 2: Staging all changes..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files staged successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Show what will be committed
Write-Host "📝 Step 3: Files to be committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Pause for review
Write-Host "Press any key to continue with commit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 4: Commit
Write-Host "💾 Step 4: Committing changes..." -ForegroundColor Yellow
git commit -m "feat: Add email OTP verification for user registration

- Implement OTP-based email verification system
- Add VerifyOTP page with 6-digit code input
- Add resend OTP functionality with 60s cooldown
- Update authSlice with verifyOTP and resendOTP actions
- Update Signup flow to redirect to OTP verification
- Update Login to handle unverified users
- Fix Redis client connection checks in middleware
- Update README with email verification documentation"

Write-Host "✅ Committed successfully!" -ForegroundColor Green
Write-Host ""

# Step 5: Pull latest
Write-Host "⬇️ Step 5: Pulling latest changes..." -ForegroundColor Yellow
git pull origin main
Write-Host ""

# Step 6: Push
Write-Host "⬆️ Step 6: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Press any key to push to remote..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

git push origin main

Write-Host ""
Write-Host "✅ All done! Your changes have been pushed to GitHub! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Check your repository on GitHub to verify the changes." -ForegroundColor Cyan
