# CBS - Complete Setup & Testing Guide

## 📖 Table of Contents
1. [Local Setup](#1-local-setup)
2. [Verify Connections](#2-verify-connections)
3. [Run Tests](#3-run-tests)
4. [Deploy to Railway](#4-deploy-to-railway)

---

## 1️⃣ Local Setup

### Prerequisites
- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **PostgreSQL** v14+ ([postgresql.org](https://postgresql.org))
- **Git** ([git-scm.com](https://git-scm.com))
- **Postman** ([postman.com](https://postman.com)) - Optional but recommended

### Step 1.1: Install Dependencies
```bash
cd your-project-directory
npm install
```

Expected output:
```
added 150 packages in 45s
```

### Step 1.2: Verify .env Configuration
```bash
cat .env
```

Should show:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=content_broadcasting
DB_USER=postgres
DB_PASSWORD=admin123
JWT_SECRET=mysupersecretkey123abc456xyz
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=src/uploads
```

**⚠️ Note:** Adjust `DB_PORT`, `DB_USER`, `DB_PASSWORD` if your PostgreSQL is different

### Step 1.3: Create Uploads Directory
```bash
mkdir -p src/uploads
```

---

## 2️⃣ Verify Connections

### Check Everything Is Connected
```bash
npm run verify
```

This script checks:
- ✅ Environment variables loaded
- ✅ NPM dependencies installed
- ✅ Port 5000 available
- ✅ Uploads directory exists and writable
- ✅ PostgreSQL connection
- ✅ Database tables

**Expected output:**
```
✅ Environment Variables
✅ Dependencies
✅ Port Availability
✅ File Upload Directory
✅ Database Connection
✅ Database Tables

✨ All checks passed! You're ready to start.
```

### If Checks Fail

**PostgreSQL Error?**
- Make sure PostgreSQL is running
- Check port 5433 is correct (usually 5432)
- Verify credentials in .env

**Database Connection Error?**
- Start PostgreSQL service
- Windows: Services → PostgreSQL
- Mac: `brew services start postgresql`
- Linux: `sudo service postgresql start`

**Port Already In Use?**
- Another app is using port 5000
- Kill the process or change PORT in .env

---

## 3️⃣ Run Tests

### Phase 1: Create Database Tables

```bash
npm run db:migrate
```

Expected output:
```
✅ All tables created successfully
```

This creates:
- `users` table
- `content` table
- `content_slots` table
- `content_schedule` table

### Phase 2: Optional - Seed Test Data

```bash
npm run db:seed
```

(Skip if not implemented yet)

### Phase 3: Start Development Server

```bash
npm run dev
```

Expected output:
```
[nodemon] starting `node src/server.js`
🚀 Server running on http://localhost:5000
📋 Health: http://localhost:5000/health
✅ Connected to PostgreSQL
```

**✅ Server is running! Don't close this terminal.**

### Phase 4: Test in New Terminal

Open a **new terminal** and test:

**Test 1: Health Check**
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-04-28T10:30:45.123Z"}
```

**Test 2: Register User**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teacher John",
    "email": "john@school.com",
    "password": "password123",
    "role": "teacher"
  }'
```

Should return:
```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Teacher John",
      "email": "john@school.com",
      "role": "teacher",
      "created_at": "2026-04-28T10:30:45.123Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Test 3: Login**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@school.com",
    "password": "password123"
  }'
```

Should return token and user data

**✅ All basic tests passing!**

---

## 🚀 Postman Testing (Recommended)

### Import Collection
1. Open **Postman**
2. Click **Import** (top left)
3. Select **postman-collection.json** from project
4. Collection loads with all endpoints organized

### Set Up Variables
1. Click **eye icon** (top right) → **Globals**
2. Add variables:

```
base_url: http://localhost:5000
teacher_token: (leave empty - will populate)
principal_token: (leave empty - will populate)
content_id: (leave empty - will populate)
teacher_id: (leave empty - will populate)
```

### Test Workflow

**Step 1: Authentication**
- POST /auth/register (Teacher)
  - Save `user.id` → `{{teacher_id}}`
  - Save `token` → `{{teacher_token}}`
  
- POST /auth/register (Principal)
  - Save `token` → `{{principal_token}}`

**Step 2: Content Upload**
- POST /content/upload
  - Use `{{teacher_token}}`
  - Upload a PDF or image file
  - Save `data.id` → `{{content_id}}`

**Step 3: Approval**
- GET /approval/pending
  - Use `{{principal_token}}`
  - Should see the uploaded content

- PATCH /approval/{{content_id}}/approve
  - Approve the content

**Step 4: Broadcasting**
- GET /content/live/{{teacher_id}}
  - No auth needed
  - Should see approved content

---

## 4️⃣ Deploy to Railway

### Step 4.1: Push to GitHub

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 4.2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose your repository
5. Click **Deploy**

Railway will auto-deploy your app!

### Step 4.3: Add PostgreSQL

1. In Railway dashboard, click **+ Create**
2. Search **PostgreSQL**
3. Click **Add PostgreSQL**
4. Wait 1 minute for database to provision

### Step 4.4: Set Environment Variables

Click your **Node App** → **Variables**

Add:
```
DATABASE_URL         (Auto-populated)
PORT                 5000
JWT_SECRET           your-secure-random-key
JWT_EXPIRES_IN       7d
MAX_FILE_SIZE        10485760
UPLOAD_DIR           src/uploads
NODE_ENV             production
```

### Step 4.5: Run Database Migration

Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway link
```

Run migration:
```bash
railway run npm run db:migrate
```

### Step 4.6: Test Production

Get your app URL from Railway dashboard (e.g., `https://myapp-prod.up.railway.app`)

Test health:
```bash
curl https://myapp-prod.up.railway.app/health
```

Update Postman `base_url` to your Railway URL and test!

---

## ✅ Complete Checklist

### Local Development
- [ ] Node.js and PostgreSQL installed
- [ ] `npm install` completed
- [ ] `.env` file configured
- [ ] `npm run verify` passes
- [ ] `npm run db:migrate` creates tables
- [ ] `npm run dev` starts without errors
- [ ] Health endpoint responds
- [ ] Can register and login
- [ ] Postman collection imported and working

### Production Deployment
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Database migration ran on Railway
- [ ] Health endpoint responds on Railway
- [ ] All Postman tests pass on Railway URL
- [ ] Logs show no errors
- [ ] Can register and login on production
- [ ] Can upload and approve content
- [ ] Public broadcast works

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **[TESTING-AND-DEPLOYMENT.md](TESTING-AND-DEPLOYMENT.md)** | Complete Postman & Railway guide |
| **[RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)** | Detailed Railway deployment |
| **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** | Command cheat sheet |
| **[postman-collection.json](postman-collection.json)** | Import in Postman |
| **[verify-connection.js](verify-connection.js)** | Connection verification script |

---

## 🆘 Troubleshooting

### Server won't start
```bash
# Check logs
npm run dev

# Common issues:
# - Port 5000 in use
# - PostgreSQL not running
# - Wrong .env credentials
```

### Database migration fails
```bash
# Check if database exists
psql -l | grep content_broadcasting

# Manually create database if needed
createdb content_broadcasting -U postgres
```

### File uploads not working
```bash
# Create uploads directory
mkdir -p src/uploads

# Check permissions
chmod 755 src/uploads
```

### Can't connect to PostgreSQL
```bash
# Verify it's running
pg_isready -h localhost -p 5433

# Start PostgreSQL if not running
```

---

## 🎯 Next Steps

1. ✅ Complete **Phase 1: Local Setup**
2. ✅ Complete **Phase 2: Verify Connections**
3. ✅ Complete **Phase 3: Run Tests**
4. ✅ Complete **Phase 4: Deploy to Railway**
5. ✅ Monitor logs and performance

---

## 💡 Tips

- **Keep dev server running**: Don't close the terminal running `npm run dev`
- **Check logs first**: Most issues show up in console logs
- **Use Postman**: Much easier than curl for complex requests
- **Save tokens**: After login, copy token to Postman variables
- **Test locally first**: Before deploying to Railway

---

## 🚀 You're Ready!

Your CBS application is production-ready. Let's go! 

Questions? Check the documentation files or review the code comments.

Good luck! 🎉

