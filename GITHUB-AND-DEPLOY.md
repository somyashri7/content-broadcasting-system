# 🚀 Push to GitHub & Deploy

## 📋 Overview

**Step 1:** Push code to GitHub  
**Step 2:** Deploy on Vercel OR Railway (choose one)

---

## Part 1️⃣: Push to GitHub

### Step 1.1: Check if Git is Initialized

```bash
cd C:\Users\HP\Downloads\cbs\cbs
git status
```

If you see files listed (not an error), you're good. Skip to Step 1.3

If you see error "Not a git repository", continue to Step 1.2

---

### Step 1.2: Initialize Git (If Needed)

```bash
git init
git add .
git commit -m "Initial commit: CBS application"
```

---

### Step 1.3: Add GitHub Remote

Your GitHub repo URL from earlier:
```
https://github.com/somyashri7/content-broadcasting-system.git
```

**Check if remote already exists:**
```bash
git remote -v
```

**If nothing shows, add it:**
```bash
git remote add origin https://github.com/somyashri7/content-broadcasting-system.git
```

**If it says "remote already exists", update it:**
```bash
git remote set-url origin https://github.com/somyashri7/content-broadcasting-system.git
```

---

### Step 1.4: Verify Remote

```bash
git remote -v
```

Should show:
```
origin  https://github.com/somyashri7/content-broadcasting-system.git (fetch)
origin  https://github.com/somyashri7/content-broadcasting-system.git (push)
```

---

### Step 1.5: Create/Switch to Main Branch

```bash
git branch -M main
```

---

### Step 1.6: Push to GitHub

```bash
git push -u origin main
```

**First time?** You might need to authenticate:
- GitHub will open browser → Authorize
- Or enter your GitHub credentials

**Expected output:**
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), done.
Total XX (delta XX), reused 0 (delta 0), compression level...
...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **Success!** Your code is on GitHub

---

### Step 1.7: Verify on GitHub

1. Go to: `https://github.com/somyashri7/content-broadcasting-system`
2. You should see your files uploaded
3. ✅ Ready to deploy!

---

## Part 2️⃣: Choose Your Deployment Platform

### 🚂 Railway vs ✈️ Vercel

| Feature | Railway | Vercel |
|---------|---------|--------|
| **PostgreSQL** | ✅ Built-in | ❌ Requires external DB |
| **File Upload** | ✅ Volumes support | ⚠️ Ephemeral (files lost) |
| **Cost** | $5-10/month | $0 Free tier (with limits) |
| **Setup Time** | 10 minutes | 5 minutes |
| **Recommended for CBS** | ✅ **Best** | ⚠️ Works but needs DB |

---

## Option A: Deploy on Railway (Recommended) ⭐

Railway is **better for CBS** because it has PostgreSQL built-in.

### A1: Create Railway Account

1. Go to: [railway.app](https://railway.app)
2. Click **Sign Up**
3. Sign up with GitHub (recommended)
4. Authorize Railway to access GitHub

---

### A2: Create New Project

1. In Railway dashboard, click **New Project**
2. Click **Deploy from GitHub repo**
3. Select your repository: `content-broadcasting-system`
4. Click **Deploy**

Railway auto-deploys! Wait 2-3 minutes...

---

### A3: Add PostgreSQL Database

1. In Railway dashboard, click **+ Create**
2. Search: **PostgreSQL**
3. Click **Add PostgreSQL**
4. Wait 30 seconds for database to provision

---

### A4: Set Environment Variables

1. Click your **Node App** service
2. Click **Variables** tab
3. Add these variables:

```
DATABASE_URL         (should be auto-populated)
JWT_SECRET           your-super-secret-key-here
PORT                 5000
JWT_EXPIRES_IN       7d
MAX_FILE_SIZE        10485760
UPLOAD_DIR           src/uploads
NODE_ENV             production
```

**Important:** Generate strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as JWT_SECRET

---

### A5: Run Database Migration

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run npm run db:migrate
```

---

### A6: Get Your App URL

1. In Railway dashboard, click **Node App**
2. Look for **Domains** section
3. You'll see: `https://content-broadcasting-system-production.up.railway.app`

This is your **Production URL**!

---

### A7: Test Production

```bash
curl https://content-broadcasting-system-production.up.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

✅ **Railway deployment complete!**

---

## Option B: Deploy on Vercel ✈️

Vercel is faster to set up but needs external PostgreSQL.

### B1: Create Vercel Account

1. Go to: [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Sign up with GitHub
4. Authorize Vercel

---

### B2: Import Project

1. Click **Add New** → **Project**
2. Click **Import Git Repository**
3. Select: `content-broadcasting-system`
4. Click **Import**

---

### B3: Configure Environment Variables

1. In Vercel dashboard, click **Settings**
2. Click **Environment Variables**
3. Add:

```
DATABASE_URL         (from your external PostgreSQL)
JWT_SECRET           your-secret-key
NODE_ENV             production
JWT_EXPIRES_IN       7d
MAX_FILE_SIZE        10485760
PORT                 (leave empty - Vercel sets it)
```

**⚠️ Important:** You need to provide DATABASE_URL from an external database service:
- Option 1: Use Railway PostgreSQL (see A3)
- Option 2: Use AWS RDS
- Option 3: Use neon.tech (free PostgreSQL)

---

### B4: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes

---

### B5: Get Your URL

1. After deployment, you'll see: `https://content-broadcasting-system.vercel.app`

This is your **Production URL**!

---

### B6: Problem with Vercel + PostgreSQL

⚠️ **Issue:** Vercel can't reach your PostgreSQL if it's not public

**Solution 1:** Use Railway's PostgreSQL
```
1. Create DATABASE_URL in Railway
2. Copy it: postgresql://user:pass@host:5432/db
3. Paste in Vercel Environment Variables
4. Redeploy
```

**Solution 2:** Use Neon PostgreSQL (free)
```
1. Go to: https://neon.tech
2. Create free PostgreSQL database
3. Copy connection string
4. Paste as DATABASE_URL in Vercel
5. Redeploy
```

---

## 📝 My Recommendation

**Use Railway** because:
- ✅ PostgreSQL included
- ✅ File upload volumes included
- ✅ Simple setup
- ✅ Only ~$10/month
- ✅ Built for Node.js apps with databases

---

## 🧪 Test Your Deployment

### Step 1: Update Postman

1. Open Postman
2. Click **eye icon** (top right) → **Globals**
3. Find `base_url`
4. Change to your production URL:
   - Railway: `https://content-broadcasting-system-production.up.railway.app`
   - Vercel: `https://content-broadcasting-system.vercel.app`
5. **Save**

---

### Step 2: Clear Variables (Important!)

In Globals, clear these because they're environment-specific:
- `teacher_token` = (clear it)
- `principal_token` = (clear it)
- `content_id` = (clear it)

These will be repopulated when you test on production.

---

### Step 3: Test Production

1. Run **Step 3** from POSTMAN-TESTING-GUIDE.md
   - GET /health
   - Should return 200 OK

2. Run **Step 4** from POSTMAN-TESTING-GUIDE.md
   - POST /auth/register (teacher)
   - Should work on production
   - Save the token (production token, different from local)

3. Run through a few more steps to verify production is working

---

## ✅ Complete Deployment Checklist

### GitHub
- [ ] Code pushed to GitHub
- [ ] All files visible on GitHub.com
- [ ] .env not included (check .gitignore)

### Railway (If chosen)
- [ ] Project created
- [ ] PostgreSQL added
- [ ] Environment variables set
- [ ] Migration ran: `railway run npm run db:migrate`
- [ ] Health endpoint responds
- [ ] Postman tests pass on production URL

### Vercel (If chosen)
- [ ] Project imported
- [ ] Environment variables set
- [ ] DATABASE_URL configured (external PostgreSQL)
- [ ] Migration ran on database
- [ ] Health endpoint responds
- [ ] Postman tests pass on production URL

---

## 🚀 Quick Reference

### Railroad/GitHub Commands
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main

# View remote
git remote -v
```

### Railway Deployment
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run npm run db:migrate

# View logs
railway logs
```

### Vercel Deployment
```bash
# Install CLI
npm i -g vercel

# Deploy
vercel

# Production URL provided after deployment
```

---

## 🔗 Your Links

**GitHub Repository:**
```
https://github.com/somyashri7/content-broadcasting-system
```

**Railway Project:**
```
https://railway.app (after deployment)
```

**Vercel Project:**
```
https://vercel.com (after deployment)
```

---

## 🆘 Troubleshooting

### "Authentication failed" when pushing to GitHub
**Solution:**
```bash
# Generate SSH key or use token
# See: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
```

### "No such file or directory: .env"
**Solution:**
- .env should NOT be in git
- Check .gitignore includes `.env`
- Create new .env on Railway/Vercel variables

### "Database connection failed" after deployment
**Solution (Railway):**
```bash
# Verify DATABASE_URL is set
railway variables

# Run migration
railway run npm run db:migrate
```

**Solution (Vercel):**
- Verify DATABASE_URL in Environment Variables
- Check database is accessible from internet
- Whitelist all IPs if using restricted firewall

### "502 Bad Gateway"
**Solution:**
1. Check logs: `railway logs` or Vercel dashboard
2. Run migration if not done
3. Verify all environment variables are set
4. Restart deployment

---

## 📚 Next Steps After Deployment

1. ✅ Test all endpoints on production with Postman
2. ✅ Monitor logs for errors
3. ✅ Set up backups (Railway → Settings)
4. ✅ Share production URL with team
5. ✅ Update documentation with production URL

---

## 🎉 You're Deployed!

Your CBS application is now:
- ✅ On GitHub (backed up)
- ✅ Live on production
- ✅ Ready for users
- ✅ Scalable and maintainable

---

**Which platform do you want to use? Railway or Vercel?**
I can provide more detailed help if needed! 🚀

