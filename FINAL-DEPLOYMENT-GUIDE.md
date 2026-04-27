# 🚀 Final Deployment Guide — Content Broadcasting System

> **One-stop guide** to push your code to GitHub and deploy on Railway (recommended) or Vercel.

---

## 📋 Pre-Flight Checklist

Before you start, confirm:
- [ ] PostgreSQL is installed locally (for development)
- [ ] Node.js v18+ is installed
- [ ] You have a [GitHub](https://github.com) account
- [ ] You have a [Railway](https://railway.app) or [Vercel](https://vercel.com) account

---

## Part 1: Push to GitHub

### Current Repository Status

Your repo is already configured with a GitHub remote:
```
origin  https://github.com/somyashri7/content-broadcasting-system.git
```

**Current state:**
- `main` branch is **1 commit ahead** of `origin/main` (unpushed)
- **1 untracked file:** `GITHUB-AND-DEPLOY.md`

### Step 1.1: Commit Untracked File

Open PowerShell in your project folder and run:

```powershell
cd C:\Users\HP\Downloads\cbs\cbs
git add GITHUB-AND-DEPLOY.md
git commit -m "docs: add GitHub and deployment guide"
```

### Step 1.2: Push to GitHub

```powershell
git push -u origin main
```

**Expected output:**
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), done.
...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### Step 1.3: Verify on GitHub

1. Go to: `https://github.com/somyashri7/content-broadcasting-system`
2. Confirm all files are visible
3. Confirm `.env` is **NOT** in the file list (it should be ignored via `.gitignore`)

✅ **GitHub push complete!**

---

## Part 2: Deploy on Railway (Recommended ⭐)

Railway is the **best choice** for CBS because it offers:
- ✅ Built-in PostgreSQL (no external DB needed)
- ✅ Persistent volumes for file uploads
- ✅ Simple environment variable management
- ✅ Automatic HTTPS
- ✅ Continuous deployment from GitHub

### Step 2.1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **Sign Up**
3. Sign up with **GitHub** (recommended — one-click authorization)

### Step 2.2: Create New Project

1. In the Railway dashboard, click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose: `content-broadcasting-system`
4. Authorize Railway to access your GitHub if prompted
5. Click **Deploy**

Railway will auto-detect Node.js, install dependencies, and start your app.

### Step 2.3: Add PostgreSQL Database

1. In your Railway project dashboard, click **+ Create** (or **New**)
2. Search for **PostgreSQL**
3. Click **Add PostgreSQL**
4. Wait 30–60 seconds for the database to provision

Railway will automatically create a `DATABASE_URL` environment variable and inject it into your app.

### Step 2.4: Set Environment Variables

1. Click your **Node App** service in the Railway dashboard
2. Go to the **Variables** tab
3. Add the following variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | *(auto-populated)* | Added automatically by Railway PostgreSQL |
| `PORT` | `5000` | CBS server port |
| `JWT_SECRET` | *(generate below)* | **Must be strong and unique** |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `MAX_FILE_SIZE` | `10485760` | 10 MB in bytes |
| `UPLOAD_DIR` | `src/uploads` | Upload folder path |
| `NODE_ENV` | `production` | Enables production optimizations |

**Generate a secure JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as the `JWT_SECRET` value.

### Step 2.5: Run Database Migration

You need to create the tables in Railway's PostgreSQL.

**Option A: Using Railway CLI (Recommended)**

```powershell
# Install Railway CLI globally
npm install -g @railway/cli

# Login (opens browser)
railway login

# Link to your project
cd C:\Users\HP\Downloads\cbs\cbs
railway link
# Select your project when prompted

# Run migration
railway run npm run db:migrate
```

**Option B: Using Railway Dashboard Terminal**

1. In Railway dashboard, click your **Node App** service
2. Go to the **Settings** tab
3. Scroll down and click **Terminal**
4. Run:
   ```bash
   npm run db:migrate
   ```

**Verify tables were created:**
```powershell
railway run "psql $DATABASE_URL -c '\dt'"
```

Expected output:
```
 public | users             | table |
 public | content           | table |
 public | content_slots     | table |
 public | content_schedule  | table |
```

### Step 2.6: (Optional) Seed Test Data

```powershell
railway run npm run db:seed
```

This creates default users:
| Email | Password | Role |
|---|---|---|
| principal@school.com | principal123 | principal |
| teacher1@school.com | teacher123 | teacher |
| teacher2@school.com | teacher123 | teacher |

### Step 2.7: Configure File Upload Volume

Railway's filesystem is **ephemeral** — uploaded files are lost on restart unless you add a volume.

1. In Railway dashboard, click your **Node App**
2. Go to **Settings** tab
3. Scroll to **Volumes**
4. Click **Add Volume**
5. Configure:
   - **Mount Path**: `/app/src/uploads`
   - **Size**: 5 GB
6. Click **Add Volume**
7. Redeploy your app (Railway will do this automatically)

> **Production tip:** For a production-grade app, migrate file storage to AWS S3 or Cloudinary instead of local volumes.

### Step 2.8: Get Your Production URL

1. In Railway dashboard, click your **Node App**
2. Look for the **Domains** section
3. Your URL will look like:
   ```
   https://content-broadcasting-system-production.up.railway.app
   ```

### Step 2.9: Verify Deployment

Test the health endpoint:
```powershell
curl https://content-broadcasting-system-production.up.railway.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-04-28T10:30:45.123Z"}
```

✅ **Railway deployment complete!**

---

## Part 3: Deploy on Vercel (Alternative ✈️)

Vercel is optimized for frontend/serverless apps. It **can** host CBS, but requires extra setup for PostgreSQL and file uploads.

### ⚠️ Important Caveats

| Feature | Vercel Support |
|---------|---------------|
| PostgreSQL | ❌ Not built-in — requires external DB |
| File Uploads | ⚠️ Ephemeral — files lost on every request |
| Server Runtime | Serverless functions (cold starts) |

**Best for:** Quick demos, frontend-heavy apps  
**Not ideal for:** CBS with file uploads and persistent database

### Step 3.1: Create External PostgreSQL (Required)

**Option A: Use Railway PostgreSQL**
1. Create a Railway project with PostgreSQL (see Part 2, Step 2.3)
2. Copy the `DATABASE_URL` from Railway
3. Use it in Vercel

**Option B: Use Neon PostgreSQL (Free)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a free PostgreSQL database
3. Copy the connection string

### Step 3.2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Sign up with **GitHub**

### Step 3.3: Import Project

1. Click **Add New** → **Project**
2. Click **Import Git Repository**
3. Select: `content-broadcasting-system`
4. Click **Import**

### Step 3.4: Configure Environment Variables

1. In Vercel dashboard, click **Settings**
2. Click **Environment Variables**
3. Add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your external PostgreSQL connection string |
| `JWT_SECRET` | Strong random string (generate with crypto) |
| `JWT_EXPIRES_IN` | `7d` |
| `MAX_FILE_SIZE` | `10485760` |
| `NODE_ENV` | `production` |

> **Note:** Do NOT set `PORT` — Vercel manages this automatically.

### Step 3.5: Deploy

1. Click **Deploy**
2. Wait 2–3 minutes

### Step 3.6: Run Database Migration

Since Vercel doesn't have a CLI runner like Railway, use your external DB's tools:

**If using Railway PostgreSQL:**
```powershell
# Set DATABASE_URL to your Railway DB, then run locally
$env:DATABASE_URL="postgresql://user:pass@host:5432/db"
npm run db:migrate
```

**If using Neon:**
Use Neon's SQL editor to run the migration SQL manually, or connect via `psql`.

### Step 3.7: Get Your URL

After deployment, Vercel provides a URL like:
```
https://content-broadcasting-system.vercel.app
```

### Step 3.8: File Upload Warning

**Files uploaded on Vercel will be lost** because serverless functions have ephemeral storage.

**Solutions:**
- Use AWS S3 / Cloudinary for file storage (recommended)
- Or use Railway instead (has persistent volumes)

---

## Part 4: Post-Deployment Testing

### Update Postman for Production

1. Open **Postman**
2. Click the **eye icon** (top right) → **Globals**
3. Update `base_url`:
   - **Railway:** `https://content-broadcasting-system-production.up.railway.app`
   - **Vercel:** `https://content-broadcasting-system.vercel.app`
4. **Clear these variables** (they are environment-specific):
   - `teacher_token`
   - `principal_token`
   - `content_id`
   - `teacher_id`
5. Click **Save**

### Test All Endpoints

Run this sequence in Postman:

| Step | Endpoint | Expected Result |
|------|----------|-----------------|
| 1 | `GET /health` | `{"status":"ok"}` |
| 2 | `POST /auth/register` | User created, token returned |
| 3 | `POST /auth/login` | Token returned |
| 4 | `POST /content/upload` | Content uploaded, status `pending` |
| 5 | `GET /approval/pending` | Principal sees pending content |
| 6 | `PATCH /approval/:id/approve` | Status changes to `approved` |
| 7 | `GET /content/live/:teacherId` | Public broadcast returns content |

> **Remember:** Tokens from local development will NOT work on production. You must log in again on production to get new tokens.

---

## Part 5: Continuous Deployment

### Railway
Every time you push to `main`:
```powershell
git add .
git commit -m "Your changes"
git push origin main
```
Railway automatically rebuilds and redeploys.

### Vercel
Same as above — Vercel auto-deploys on every push to `main`.

---

## Part 6: Troubleshooting

### "Database connection failed"
**Railway:**
- Verify `DATABASE_URL` is set in Variables
- Check PostgreSQL service is running (green dot in dashboard)
- Run: `railway logs` to see detailed errors

**Vercel:**
- Verify `DATABASE_URL` points to a publicly accessible database
- Check if the database allows connections from Vercel's IP range

### "502 Bad Gateway"
- Check logs: `railway logs` (Railway) or Vercel dashboard → Functions
- Verify `npm start` works locally: `npm start`
- Ensure `PORT` uses `process.env.PORT || 5000` (already correct in your code)
- Run migration if not done yet

### "File uploads not persisting"
- **Railway:** Add a volume (see Part 2, Step 2.7)
- **Vercel:** Files will always be ephemeral — migrate to S3/Cloudinary

### "Invalid or expired token"
- Don't mix local and production tokens
- Ensure `JWT_SECRET` matches between login and verification
- Check `JWT_EXPIRES_IN` hasn't expired

### "Migration failed: table already exists"
This is OK — it means the migration already ran. Continue testing.

### "Port already in use" (local development)
```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process
taskkill /PID <PID> /F
```

---

## 📊 Platform Comparison

| Feature | Railway ⭐ | Vercel |
|---------|-----------|--------|
| PostgreSQL | ✅ Built-in | ❌ External required |
| File Upload Persistence | ✅ Volumes | ❌ Ephemeral |
| Setup Complexity | Low | Medium (needs external DB) |
| Cost | ~$5–10/month | Free tier (with limits) |
| Best For | Full-stack Node.js apps | Frontend / JAMstack |
| **Recommendation for CBS** | ✅ **Use Railway** | ⚠️ Use only for demos |

---

## 🔗 Quick Reference Links

| Resource | URL |
|----------|-----|
| Your GitHub Repo | `https://github.com/somyashri7/content-broadcasting-system` |
| Railway Dashboard | `https://railway.app/dashboard` |
| Vercel Dashboard | `https://vercel.com/dashboard` |
| Neon PostgreSQL (free) | `https://neon.tech` |

---

## ✅ Final Checklist

### GitHub
- [ ] `GITHUB-AND-DEPLOY.md` committed
- [ ] All commits pushed to `origin/main`
- [ ] `.env` is NOT in the repository
- [ ] Files visible on github.com

### Railway Deployment
- [ ] Project created from GitHub repo
- [ ] PostgreSQL service added
- [ ] All environment variables set
- [ ] `JWT_SECRET` is strong and unique
- [ ] Database migration ran successfully
- [ ] Volume added for file uploads (optional but recommended)
- [ ] `/health` endpoint returns 200
- [ ] Postman tests pass on production URL

### Vercel Deployment (if chosen)
- [ ] Project imported from GitHub
- [ ] External PostgreSQL configured
- [ ] Environment variables set
- [ ] Database migration ran
- [ ] `/health` endpoint returns 200

---

**🎉 You're ready to deploy! Start with Part 1 (GitHub Push) and then choose Railway or Vercel.**

