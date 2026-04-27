# 🚨 502 Error - Railway Troubleshooting

## What 502 Means
Your app is deployed but **not starting properly**. Common causes:
- Database connection failed
- Missing environment variables
- Migration not run
- Port configuration issue
- Code errors in server startup

---

## 🔍 Step 1: Check Railway Logs

### In Railway Dashboard:
1. Go to your project
2. Click your **Node App** service
3. Click **Logs** tab
4. **Scroll to the bottom** - look for errors

### Look For These Errors:

**Error 1: "ECONNREFUSED" / Database Connection**
```
Error: connect ECONNREFUSED 127.0.0.1:5433
```
**Solution:** See Step 2

---

**Error 2: "relation does not exist"**
```
Error: relation "users" does not exist
```
**Solution:** Run migration (Step 3)

---

**Error 3: "Cannot find module"**
```
Error: Cannot find module 'pg'
```
**Solution:** Dependencies not installed (Step 4)

---

**Error 4: "Environment variable missing"**
```
Error: DATABASE_URL not set
```
**Solution:** Set environment variables (Step 5)

---

## ✅ Step 2: Verify Database Connection

### Check if PostgreSQL is Running:

1. In Railway dashboard, click **PostgreSQL** service
2. Verify it shows **green** status (not red/crashed)
3. If red, **restart the service**

### Verify DATABASE_URL:

1. Click your **Node App** → **Variables** tab
2. Find `DATABASE_URL`
3. Should look like:
   ```
   postgresql://user:password@host:port/database
   ```
4. **Should NOT be empty!**

If missing, Railway auto-generates it. Restart your app:
1. Click **Node App** → **Settings**
2. Scroll down → **Redeploy** button
3. Click **Redeploy**

---

## ✅ Step 3: Run Database Migration

Your tables aren't created yet!

### Option A: Using Railway CLI

```bash
# Install Railway CLI (if not already)
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run npm run db:migrate

# Seed data (optional)
railway run npm run db:seed
```

### Option B: Using Railway Dashboard Terminal

1. Click **Node App** → **Settings**
2. Scroll to **Terminal** section
3. Run:
```bash
npm run db:migrate
```

### Option C: Verify in Railway Dashboard

1. Click **PostgreSQL** service
2. Click **Data** or **Query** tab
3. You should see your tables:
   - `users`
   - `content`
   - `content_slots`
   - `content_schedule`

---

## ✅ Step 4: Check All Environment Variables

### Required Variables in Railway:

Click your **Node App** → **Variables** tab

Must have these:
```
DATABASE_URL              (auto-populated by Railway)
PORT                      5000
JWT_SECRET                your-secret-key-here
JWT_EXPIRES_IN            7d
MAX_FILE_SIZE             10485760
UPLOAD_DIR                src/uploads
NODE_ENV                  production
```

### Add Missing Variables:

If any are missing:
1. Click **Add Variable**
2. Enter key and value
3. Click **Save**

---

## ✅ Step 5: Restart the Application

After making any changes:

1. Click **Node App** → **Settings**
2. Scroll down → **Restart** button
3. Click **Restart**

Wait 30 seconds for restart

---

## ✅ Step 6: Check Updated Logs

After restart, check logs again:

1. Click **Node App** → **Logs** tab
2. Look for:
   ```
   🚀 Server running
   ✅ Connected to PostgreSQL
   ```

If you see these = **App is working!**

---

## 🆘 Still Getting 502?

### Last Resort: Full Redeploy

1. Go to your **Node App** → **Settings**
2. Find **Deployment** section
3. Click **Redeploy** button
4. Railway rebuilds and redeploys
5. Wait 2-3 minutes
6. Check logs

---

## 🔧 Quick Checklist

- [ ] Check Railway logs (see actual error)
- [ ] PostgreSQL service is running (green status)
- [ ] DATABASE_URL is set (not empty)
- [ ] All environment variables are set
- [ ] Run `railway run npm run db:migrate`
- [ ] Restart Node App
- [ ] Check logs for "🚀 Server running"

---

## 📞 Common 502 Causes & Fixes

| Error in Logs | Cause | Fix |
|---------------|-------|-----|
| ECONNREFUSED 127.0.0.1 | Can't connect to DB | Set DATABASE_URL, restart PostgreSQL |
| relation "users" does not exist | Tables not created | Run `railway run npm run db:migrate` |
| Cannot find module 'pg' | Missing dependency | `npm install` was skipped, redeploy |
| DATABASE_URL not defined | Env var missing | Add DATABASE_URL in Variables tab |
| Port already in use | PORT config issue | Change PORT in Variables or use default 5000 |
| JWT_SECRET not found | Missing env var | Add JWT_SECRET to Variables |

---

## 🚀 Next Steps After Fixing

1. **Test health endpoint:**
   ```bash
   curl https://your-app-url.railway.app/health
   ```

2. **Should return:**
   ```json
   {"status":"ok","timestamp":"..."}
   ```

3. **Then test Postman:**
   - Update base_url to production URL
   - Run through test workflow

---

## 📋 Reference

**Your App URL:**
```
https://content-broadcasting-system-production.up.railway.app
```

**Railway Docs:** [docs.railway.app](https://docs.railway.app)

**Questions?** Check logs first - they tell you exactly what's wrong!

