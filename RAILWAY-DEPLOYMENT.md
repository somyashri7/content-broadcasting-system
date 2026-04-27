# Railway Deployment Guide - CBS

## 🚀 Quick Start (5 minutes)

### Prerequisites
- GitHub account with repository
- Railway account (free tier available at railway.app)
- Git installed locally

---

## Step 1: Prepare Your Repository

### 1.1 Create GitHub Repository
```bash
cd your-project-directory
git init
git add .
git commit -m "Initial commit: CBS application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/content-broadcasting-system.git
git push -u origin main
```

### 1.2 Verify .gitignore
Ensure sensitive files are NOT committed:
```bash
cat .gitignore
```

Should contain:
```
node_modules/
.env
src/uploads/*
*.log
```

---

## Step 2: Create Railway Project

### 2.1 Link Repository to Railway
1. Go to **[railway.app](https://railway.app)**
2. Sign up / Login with GitHub
3. Click **New Project**
4. Select **Deploy from GitHub repo**
5. Choose your repository
6. Authorize Railway to access GitHub
7. Click **Deploy**

Railway will:
- Detect Node.js environment
- Install dependencies
- Build and start your app
- Provide a public URL

---

## Step 3: Configure PostgreSQL Database

### 3.1 Add PostgreSQL Service
1. In your Railway project dashboard
2. Click **+ Create** (or **Add Service**)
3. Search for **PostgreSQL**
4. Click **Add PostgreSQL**
5. Wait 30-60 seconds for database to provision

### 3.2 Verify Database Connection
- Click the **PostgreSQL** service in dashboard
- Click **Variables** tab
- You'll see `DATABASE_URL` auto-generated

---

## Step 4: Set Environment Variables

### 4.1 Add Variables to Your App Service

Click your **Node App** service → **Variables** tab → Add these:

```
DATABASE_URL         (Auto-populated by Railway)
PORT                 5000
JWT_SECRET           your-super-secret-key-here-change-this
JWT_EXPIRES_IN       7d
MAX_FILE_SIZE        10485760
UPLOAD_DIR           src/uploads
NODE_ENV             production
```

**⚠️ IMPORTANT: Change `JWT_SECRET`**
- Don't use the example value
- Use a strong random string
- Generate one:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 4.2 Configure Node.js Environment
Set `NODE_ENV` to `production` for better performance

---

## Step 5: Run Database Migration

### Option A: Using Railway CLI (Recommended)

**Install Railway CLI:**
```bash
npm install -g @railway/cli
```

**Login:**
```bash
railway login
# Opens browser to authenticate
```

**Link Your Project:**
```bash
cd your-project-directory
railway link
# Select your project when prompted
```

**Run Migration:**
```bash
railway run npm run db:migrate
```

**Optional - Seed Test Data:**
```bash
railway run npm run db:seed
```

### Option B: Manual via Railway Dashboard Terminal

1. In Railway dashboard, click your **Node App** service
2. Click **Settings** tab
3. Scroll down and click **Terminal**
4. In the terminal, run:
   ```bash
   npm run db:migrate
   npm run db:seed    # optional
   ```

### Option C: Verify Tables Were Created

```bash
# After migration, check tables exist
railway run "psql $DATABASE_URL -c '\\dt'"
```

Should show:
```
 public | users
 public | content
 public | content_slots
 public | content_schedule
```

---

## Step 6: Test Deployment

### 6.1 Get Your App URL
- In Railway dashboard, click your **Node App**
- Copy the **Domains** URL (e.g., `https://myapp-prod.up.railway.app`)

### 6.2 Test Health Endpoint
```bash
curl https://myapp-prod.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-28T10:30:45.123Z"
}
```

### 6.3 Update Postman Collection
1. Open Postman
2. Edit `base_url` variable
3. Replace `http://localhost:5000` with your Railway URL
4. Test all endpoints again

---

## 📁 File Upload Storage

### ⚠️ Problem: Ephemeral Filesystem
Railway uses **ephemeral storage** - files are deleted when:
- Your app restarts
- New deployment happens
- Server restarts

### Solution 1: Use Railway Volumes (Development)

1. In Railway dashboard → Your **Node App** → **Settings**
2. Scroll to **Volumes**
3. Click **Add Volume**
4. Configure:
   - **Mount Path**: `/app/src/uploads`
   - **Size**: 5GB (for free tier)
5. Click **Add Volume**
6. Redeploy your app

Now files persist across restarts!

### Solution 2: Use Object Storage (Production)

For production, use **S3 or Cloudinary**:

**Install AWS SDK:**
```bash
npm install aws-sdk
```

**Update .env:**
```
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
```

**Modify uploadContent() in controllers:**
```javascript
// Instead of saving to local filesystem
const file_url = await uploadToS3(req.file);
```

---

## 🔐 Security Checklist

Before production, ensure:

- [ ] **JWT_SECRET** is changed to strong random value
- [ ] **DATABASE_URL** uses SSL (Railway default)
- [ ] **CORS** is restricted to your domain
- [ ] **File upload** has size limits
- [ ] **Rate limiting** is enabled
- [ ] **Database backups** are configured
- [ ] **Error logs** don't expose sensitive data
- [ ] **HTTPS** is enabled (Railway default)
- [ ] **Node modules** don't include dev dependencies in production

---

## 📊 Monitor Your Deployment

### 6.1 View Logs
1. Click your **Node App** service
2. Click **Logs** tab
3. Watch real-time application logs

### 6.2 Monitor Performance
- **Deployments tab**: See deployment history
- **Metrics tab**: CPU, Memory, Network usage
- **Database tab**: Query performance, storage

### 6.3 Set Up Alerts
1. In Railway dashboard → **Settings**
2. Configure **Webhooks** for deployment events
3. Set alerts for high resource usage

---

## 🐛 Troubleshooting

### "Database connection failed"
```
Error: connect ECONNREFUSED

Solution:
1. Verify DATABASE_URL in Variables
2. Check PostgreSQL service is running
3. Run: railway logs (to see errors)
4. Restart both services: Stop → Deploy again
```

### "Migration failed: table already exists"
```
Error: relation "users" already exists

This is OK! It means migration already ran.
Just skip and continue.
```

### "File uploads not persisting"
```
Solution:
1. Add Railway Volume (see File Upload Storage section)
2. Or migrate to S3/Cloudinary
3. Redeploy after configuration
```

### "High memory usage"
```
Check logs for:
- Memory leaks in code
- Unfinished database connections
- Large file uploads

Increase:
- app.memory in railway.json
- Or upgrade Railway plan
```

### "Build failed"
```bash
# Check for:
1. Missing environment variables
2. Unsupported Node version
3. Missing dependencies in package.json

# Solution:
1. Verify .env.example has all variables
2. Check package.json scripts
3. Test locally first: npm start
```

---

## 📈 Scaling Your App

### Increase Resources
1. Click your **Node App** service
2. Click **Settings**
3. Increase **Memory** allocation
4. Redeploy

### Enable Auto-scaling
1. **Settings** → **Deploy**
2. Set **Restart Policy**: on failure
3. Enable **Health Check**: /health

### Database Optimization
- Add PostgreSQL indexes on frequently queried columns
- Backup database regularly
- Monitor query performance

---

## 🔄 Continuous Deployment

Every time you push to main branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway automatically:
1. Triggers new build
2. Installs dependencies
3. Runs new deployment
4. Updates your live app

---

## 📊 Expected Costs (Railway Free Tier)

- **Compute**: $5/month worth of free credits
- **PostgreSQL**: Included in free tier (1 database)
- **Bandwidth**: Included
- **Storage**: 100GB included

For your CBS application:
- Basic deployment: ~$10/month (paid tier)
- With backups + volumes: ~$15-20/month

---

## 🎯 Post-Deployment Checklist

- [ ] App deployed successfully
- [ ] Database migrations ran
- [ ] Health endpoint responds
- [ ] Authentication works (login/register)
- [ ] Content upload works
- [ ] Principal approval workflow works
- [ ] Public broadcast endpoint works
- [ ] File uploads persist
- [ ] No errors in logs
- [ ] Backups configured
- [ ] Monitoring alerts set up

---

## 📞 Support

**Railway Support**: [docs.railway.app](https://docs.railway.app)

**Common Commands:**
```bash
# View logs
railway logs

# Run migration
railway run npm run db:migrate

# SSH into container
railway shell

# Local development
npm run dev

# Test connection
npm run verify
```

---

## 🎓 Next Steps

1. ✅ Deploy to Railway
2. ✅ Test all endpoints (use Postman)
3. ✅ Monitor logs for 24 hours
4. ✅ Set up backups
5. ✅ Configure custom domain (optional)
6. ✅ Migrate to S3 for file storage (recommended for production)

Good luck with your deployment! 🚀

