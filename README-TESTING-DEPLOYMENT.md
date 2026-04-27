# 📦 CBS - Postman Testing & Railway Deployment - Complete Package

## 🎯 What You Now Have

I've prepared everything you need to test your Content Broadcasting System and deploy it to Railway. Here's exactly what was created:

---

## 📋 Files Created

### 1. **postman-collection.json** ⭐
The complete Postman API collection with:
- ✅ All 12 endpoints organized in 5 folders
- ✅ Pre-configured variables (base_url, tokens, IDs)
- ✅ Request bodies with examples
- ✅ Ready to import → test immediately

**How to use:**
1. Open Postman
2. Click Import → Select `postman-collection.json`
3. Set your `base_url` to `http://localhost:5000`
4. Start testing!

---

### 2. **Documentation Files**

#### 📖 **SETUP-COMPLETE.md** - START HERE FIRST
**Purpose:** Complete end-to-end guide  
**Contains:**
- Local setup instructions (5 min)
- Connection verification (5 min)
- Testing workflow with Postman (15 min)
- Railway deployment guide (10 min)
- Complete checklist
- Troubleshooting for common issues

**Read this first to understand the flow**

---

#### 📖 **TESTING-AND-DEPLOYMENT.md** - DETAILED REFERENCE
**Purpose:** In-depth testing and deployment guide  
**Contains:**
- Detailed Postman setup instructions
- 5-phase testing workflow with expected outputs
- Connection verification checklist (what to verify)
- Railway deployment steps with multiple options
- File upload handling solutions
- Security checklist for production
- Troubleshooting section

**Use when you need detailed steps or examples**

---

#### 📖 **RAILWAY-DEPLOYMENT.md** - DEPLOYMENT FOCUS
**Purpose:** Everything about Railway deployment  
**Contains:**
- Quick start (5 minutes)
- Step-by-step Railway setup
- Database configuration
- Environment variables reference
- File storage solutions (volumes vs S3)
- Monitoring and scaling
- Cost information
- Post-deployment checklist

**Use when setting up or troubleshooting Railway**

---

#### 📖 **QUICK-REFERENCE.md** - CHEAT SHEET
**Purpose:** Command reference and quick lookup  
**Contains:**
- All npm commands
- Curl examples for each endpoint
- PostgreSQL commands
- Railway CLI commands
- Debugging tips
- File structure
- API endpoint summary table
- Common issues & solutions

**Use for quick lookups and testing with curl**

---

### 3. **verify-connection.js** - Connection Checker
**Purpose:** Verify everything is properly connected  
**Checks:**
- Environment variables loaded ✓
- Dependencies installed ✓
- Port 5000 available ✓
- Uploads directory exists ✓
- PostgreSQL connection ✓
- Database tables created ✓

**Run with:** `npm run verify`

**Output:** Color-coded status report with actionable steps

---

## 🚀 Quick Start (15 minutes)

### Step 1: Verify Connections (2 min)
```bash
npm run verify
```
✅ Should pass all checks

### Step 2: Create Database (1 min)
```bash
npm run db:migrate
```
✅ Tables created: users, content, content_slots, content_schedule

### Step 3: Start Server (2 min)
```bash
npm run dev
```
✅ Should see: "🚀 Server running on http://localhost:5000"

### Step 4: Import Postman Collection (1 min)
- Open Postman
- Import `postman-collection.json`
- Set `base_url` to `http://localhost:5000`

### Step 5: Test All Endpoints (5 min)
Follow this workflow:
1. **Register teacher** (POST /auth/register) → Copy token
2. **Upload content** (POST /content/upload) → Copy ID
3. **Register principal** → Copy token
4. **View pending** (GET /approval/pending) → See your upload
5. **Approve content** (PATCH /approval/:id/approve)
6. **Get live content** (GET /content/live/:teacherId)
7. **Health check** (GET /health)

✅ All working = Your app is ready!

---

## 🧪 What to Check - Connection Verification

### Database Connection
- ✅ PostgreSQL running on `localhost:5433`
- ✅ Can connect with credentials in `.env`
- ✅ Database tables created (run migration)
- ✅ No connection errors in server logs

### Authentication Flow
- ✅ Can register user (gets token)
- ✅ Token is valid and can be used
- ✅ Protected routes reject requests without token
- ✅ Protected routes reject wrong role
- ✅ Login returns correct user data

### Content Upload
- ✅ File stored in `src/uploads/`
- ✅ File URL generated correctly
- ✅ Database record created with all fields
- ✅ Content status is "pending" initially
- ✅ Subject slot created automatically

### Approval Workflow
- ✅ Principal can see all pending content
- ✅ Principal can approve/reject
- ✅ Status updates to approved/rejected
- ✅ Teacher can only see own content
- ✅ Approved content shows in live broadcast

### Broadcasting (Public)
- ✅ Works without authentication
- ✅ Returns only approved content
- ✅ Respects time windows
- ✅ Filters by subject
- ✅ Rate limiting works (60 req/min)

---

## 🚂 Railway Deployment (10 minutes)

### Phase 1: Prepare (2 min)
```bash
git add .
git commit -m "Ready for Railway"
git push origin main
```

### Phase 2: Create Project (3 min)
1. Go to railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-deploys

### Phase 3: Add Database (2 min)
1. Click "+ Create"
2. Add PostgreSQL
3. Railway creates `DATABASE_URL` automatically

### Phase 4: Set Variables (1 min)
Add to your Node app:
```
DATABASE_URL (auto-populated)
JWT_SECRET=your-secure-key-here
NODE_ENV=production
```

### Phase 5: Run Migration (1 min)
```bash
railway run npm run db:migrate
```

### Phase 6: Test Production (1 min)
```bash
curl https://your-app-url.railway.app/health
```

✅ Returns health status = Deployed successfully!

---

## 📁 File Structure After Setup

```
project/
├── postman-collection.json          ⭐ Import in Postman
├── SETUP-COMPLETE.md                📖 START HERE
├── TESTING-AND-DEPLOYMENT.md        📖 Detailed guide
├── RAILWAY-DEPLOYMENT.md            📖 Deployment guide
├── QUICK-REFERENCE.md               📖 Command reference
├── verify-connection.js             🔍 Verification script
├── railway.json                     ⚙️ Railway config
├── package.json                     (updated with verify script)
├── .env                             (already configured)
├── .gitignore                       (already configured)
├── src/
│   ├── server.js
│   ├── config/db.js
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── models/
│   ├── services/
│   ├── utils/
│   └── uploads/                     📁 File uploads go here
└── ...
```

---

## ⚡ Key Commands

```bash
# Verify everything connected
npm run verify

# Create database tables
npm run db:migrate

# Start development server
npm run dev

# Test an endpoint
curl http://localhost:5000/health

# Deploy to Railway (after git push)
railway run npm run db:migrate
```

---

## 🆘 If Something Doesn't Work

### "PostgreSQL connection failed"
- ✅ PostgreSQL running? 
- ✅ Port 5433 correct?
- ✅ Credentials in .env correct?
- 👉 See **QUICK-REFERENCE.md** → "PostgreSQL won't connect"

### "Token invalid"
- ✅ Copy full token from login response?
- ✅ Include "Bearer " in Authorization header?
- 👉 See **TESTING-AND-DEPLOYMENT.md** → "Token Errors"

### "Table does not exist"
- ✅ Run `npm run db:migrate` first?
- 👉 See **SETUP-COMPLETE.md** → "Phase 1: Create Database"

### "Port 5000 already in use"
- ✅ Kill process using port 5000
- ✅ Or change PORT in .env to 5001
- 👉 See **QUICK-REFERENCE.md** → "Port already in use"

### "Railway deployment failed"
- ✅ Check Railway logs: `railway logs`
- ✅ Verify environment variables are set
- ✅ Run migration: `railway run npm run db:migrate`
- 👉 See **RAILWAY-DEPLOYMENT.md** → "Troubleshooting"

---

## 📋 Testing Checklist

### Before Testing
- [ ] `npm install` completed
- [ ] `.env` file exists with DB credentials
- [ ] PostgreSQL is running
- [ ] Port 5000 is available

### During Testing
- [ ] `npm run verify` passes all checks
- [ ] `npm run db:migrate` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Can register user and get token
- [ ] Can login and get token
- [ ] Can upload content as teacher
- [ ] Can approve/reject as principal
- [ ] Can get live broadcast (public)

### Before Production
- [ ] All tests pass locally
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set (change JWT_SECRET!)
- [ ] Migration ran on Railway
- [ ] All endpoints tested on Railway URL
- [ ] Logs show no errors
- [ ] File upload working (use volumes or S3)

---

## 🎯 Next Steps

1. **Read:** `SETUP-COMPLETE.md` (10 min)
2. **Run:** `npm run verify` (2 min)
3. **Run:** `npm run db:migrate` (1 min)
4. **Run:** `npm run dev` (server running)
5. **Import:** `postman-collection.json` into Postman
6. **Test:** Follow workflow in Postman (5 min)
7. **Deploy:** Follow `RAILWAY-DEPLOYMENT.md` (15 min)

---

## 📚 Documentation Reference

| Need | File |
|------|------|
| Getting started | **SETUP-COMPLETE.md** |
| Detailed testing | **TESTING-AND-DEPLOYMENT.md** |
| Railway deployment | **RAILWAY-DEPLOYMENT.md** |
| Quick commands | **QUICK-REFERENCE.md** |
| API testing | **postman-collection.json** |

---

## ✨ What You're Testing

Your CBS (Content Broadcasting System) has:

1. **Authentication Module**
   - Register teacher/principal ✅
   - Login with JWT ✅
   - Protected routes ✅

2. **Content Management**
   - Teachers upload content ✅
   - Files stored locally ✅
   - Metadata saved to database ✅

3. **Approval Workflow**
   - Principals review pending content ✅
   - Approve or reject with reason ✅
   - Update content status ✅

4. **Broadcasting System**
   - Public endpoint (no auth) ✅
   - Returns active content for teacher ✅
   - Filters by subject ✅
   - Rate limited (60 req/min) ✅

5. **Database**
   - PostgreSQL with 4 tables ✅
   - Proper relationships ✅
   - Cascading deletes ✅

---

## 🎉 You're All Set!

Everything is configured and ready. The Postman collection covers all endpoints, the documentation is comprehensive, and the verification script ensures your environment is properly connected.

**Start with:** `SETUP-COMPLETE.md`

**Then:** `npm run verify` 

**Then:** `npm run dev` and Postman testing

**Finally:** Railway deployment with `RAILWAY-DEPLOYMENT.md`

---

Good luck! Your CBS application is production-ready. 🚀

