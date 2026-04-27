# CBS - Postman Testing & Deployment Guide

## 📋 POSTMAN TESTING SETUP

### 1. Import the Collection

**Steps:**
1. Open **Postman** → Click **Import** button (top-left)
2. Select the **postman-collection.json** file from this project
3. The collection will load with all endpoints organized in folders

### 2. Configure Environment Variables

In Postman, set up these variables in your **Globals** or create an **Environment**:

```
base_url: http://localhost:5000
teacher_token: (Leave empty - will be populated after login)
principal_token: (Leave empty - will be populated after login)
content_id: (Will be populated after upload)
teacher_id: (Will be populated after registration)
```

**How to set variables in Postman:**
- Click the **eye icon** (top right) → **Globals** or **Environments**
- Add variables in the table
- Save

---

## ✅ TESTING WORKFLOW

### Phase 1: Authentication
```
1. POST /auth/register (Teacher)
   - Copy the returned user.id → {{teacher_id}}
   - Copy the returned token → {{teacher_token}}

2. POST /auth/register (Principal)
   - Copy the returned user.id
   - Copy the returned token → {{principal_token}}

3. GET /auth/me
   - Use {{teacher_token}}
   - Should return your teacher profile
```

### Phase 2: Content Upload (Teacher)
```
1. POST /content/upload
   - Set Authorization header: Bearer {{teacher_token}}
   - Fill form-data fields:
     * title: "Mathematics Basics"
     * subject: "mathematics"
     * description: "Introduction to algebra"
     * start_time: 2026-04-28T09:00:00Z
     * end_time: 2026-04-28T10:00:00Z
     * rotation_duration: 5
     * file: Select a PDF or image file
   
   - Copy returned content.id → {{content_id}}
   - Verify status is "pending"

2. GET /content/my
   - Should list your uploaded content
   - Filter by status=pending, subject=mathematics

3. GET /content/{{content_id}}
   - Retrieve full content details
```

### Phase 3: Approval (Principal)
```
1. GET /approval/pending
   - Use {{principal_token}}
   - Should show content from teachers (status: pending)

2. GET /approval/all
   - Query all content by status, subject, or teacher_id
   - Verify teacher details are included

3. PATCH /approval/{{content_id}}/approve
   - Approve the content uploaded by teacher
   - Verify status changes to "approved"

4. PATCH /approval/{{content_id}}/reject
   - Try on another content with rejection_reason
   - Verify status changes to "rejected"
```

### Phase 4: Broadcasting (Public)
```
1. GET /content/live/{{teacher_id}}
   - No authentication required
   - Returns currently active, approved, scheduled content
   - Try with query: ?subject=mathematics

2. GET /content/live/9999
   - Test with invalid teacher ID
   - Should return: { success: true, message: "No content available", data: [] }
```

### Phase 5: Health Check
```
1. GET /health
   - No auth required
   - Should return: { status: "ok", timestamp: "ISO-date" }
   - Verify DB connection logs in console
```

---

## 🔍 WHAT TO CHECK FOR PROPER CONNECTIONS

### Database Connection
- When server starts, look for log: **✅ Connected to PostgreSQL**
- Check [.env](.env) has correct credentials
- Run: `npm run db:migrate` before first tests

### Authentication Flow
✅ Verify these work:
- Token generation on register/login
- Token validation on protected routes
- Role-based access (teacher vs principal)
- 401 Unauthorized when no token
- 403 Forbidden when wrong role

### Content Upload
✅ Verify these work:
- File stored in [src/uploads/](src/uploads/)
- File URL generated correctly: `/uploads/{filename}`
- Database record created with all fields
- content_slots auto-created for subject
- content_schedule entry linked

### Approval Workflow
✅ Verify these work:
- Principal can see all pending content
- Principal can approve/reject
- Status updates in database
- Teacher can only see own content
- Approved content shows in live broadcast

### Broadcasting
✅ Verify these work:
- Public access without authentication
- Correct active content returned (by time window)
- Subject filtering works
- Rate limiting: 60 req/min per IP

---

## 🚀 RAILWAY DEPLOYMENT STEPS

### Step 1: Prepare Repository

**Create GitHub repository:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/content-broadcasting-system.git
git push -u origin main
```

**Important: Never commit .env**
```bash
# Already in .gitignore? Verify:
cat .gitignore
# Should include: .env, node_modules/, uploads/
```

### Step 2: Create Railway Project

1. Go to **[railway.app](https://railway.app)**
2. Click **New Project** → **Deploy from GitHub**
3. Select the repository
4. Railway will auto-detect Node.js

### Step 3: Configure Database

**Add PostgreSQL Plugin:**
1. In Railway dashboard, click **+ Create** (or **Add Plugins**)
2. Search **PostgreSQL**
3. Click **Add**
4. Wait 30 seconds for database to provision

**Get Database Credentials:**
- Railway auto-generates `DATABASE_URL` environment variable
- This will be: `postgresql://user:password@host:port/dbname`

### Step 4: Set Environment Variables

In Railway Dashboard → **Variables** tab:

```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=5000
JWT_SECRET=your-super-secret-key-change-this-in-production
MAX_FILE_SIZE=10485760
UPLOAD_DIR=src/uploads
JWT_EXPIRES_IN=7d
```

**Important: Change JWT_SECRET** (don't use the example one!)

### Step 5: Run Database Migration

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run npm run db:migrate

# Run seed (optional)
railway run npm run db:seed
```

**Option B: Manual via SSH**
1. In Railway dashboard, click your App service
2. Click **Terminal** tab
3. Run:
   ```bash
   npm run db:migrate
   npm run db:seed  # optional
   ```

### Step 6: Deploy

1. Push code to GitHub
2. Railway auto-deploys on push
3. Watch **Deployments** tab
4. Check logs for errors

**Expected logs:**
```
🚀 Server running on http://0.0.0.0:5000
✅ Connected to PostgreSQL
📋 Health: http://localhost:5000/health
```

### Step 7: Test Deployment

Get your Railway app URL (e.g., `https://myapp-prod.up.railway.app`):

```bash
# Test health endpoint
curl https://myapp-prod.up.railway.app/health

# Should return:
# {"status":"ok","timestamp":"2026-04-28T..."}

# Update Postman base_url to your Railway URL
# And test all endpoints again
```

---

## 📁 File Upload Handling on Railway

**Note:** Railway uses ephemeral filesystem
- Files uploaded to `/src/uploads/` will be **deleted on restart**
- For production, use **S3, Google Cloud Storage, or Cloudinary**

**Option 1: Keep Local (Development)**
- OK for testing
- Files lost on deployment restart

**Option 2: Use Railway Volumes (Recommended)**
1. In Railway dashboard, click your App
2. Click **Settings** tab
3. Under **Volumes**, add:
   - Mount Path: `/app/src/uploads`
4. Deploy again

**Option 3: Migrate to S3 (Production)**
- Install: `npm install aws-sdk`
- Update uploadContent() to upload to S3
- Store file_url as S3 URL

---

## 🔒 Security Checklist Before Production

- [ ] Change `JWT_SECRET` in Railway environment
- [ ] Set up HTTPS (Railway provides automatically)
- [ ] Restrict CORS origins (update [server.js](src/server.js) cors config)
- [ ] Add rate limiting to all endpoints
- [ ] Implement file type validation
- [ ] Set MAX_FILE_SIZE appropriately
- [ ] Use strong database passwords
- [ ] Enable SSL for database connection (Railway does this)
- [ ] Add request validation middleware
- [ ] Set up monitoring/error tracking (Sentry, etc.)

---

## 🐛 Troubleshooting

### Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solutions:
1. Check .env DATABASE_URL is correct
2. Ensure PostgreSQL is running locally
3. For Railway: Verify DATABASE_URL in Railway env vars
4. Check IP whitelist if using managed database
```

### Token Errors
```
Error: Invalid or expired token

Solutions:
1. Copy full token from login response (no spaces)
2. Include "Bearer " prefix in Authorization header
3. Check JWT_SECRET matches in .env
4. Verify token hasn't expired (JWT_EXPIRES_IN: 7d)
```

### File Upload Errors
```
Error: Upload failed / File is required

Solutions:
1. Ensure file is selected in Postman form-data
2. Check MAX_FILE_SIZE in .env
3. Verify src/uploads/ directory exists and is writable
4. Check file type is allowed
```

### Database Migration Errors
```
Error: relation "users" does not exist

Solutions:
1. Run: npm run db:migrate
2. Check migrations exist in src/models/migrate.js
3. Verify database user has CREATE permissions
4. For Railway: Use railway run npm run db:migrate
```

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Start production | `npm start` |
| Run migrations | `npm run db:migrate` |
| Seed data | `npm run db:seed` |
| Install dependencies | `npm install` |
| Deploy to Railway | `git push origin main` |

---

## 📚 API Endpoint Summary

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | /auth/register | ❌ | - | Create user account |
| POST | /auth/login | ❌ | - | Get JWT token |
| GET | /auth/me | ✅ | Any | Get current user |
| POST | /content/upload | ✅ | teacher | Upload content |
| GET | /content/my | ✅ | teacher | List own content |
| GET | /content/:id | ✅ | any | Get content details |
| GET | /approval/all | ✅ | principal | List all content |
| GET | /approval/pending | ✅ | principal | List pending |
| PATCH | /approval/:id/approve | ✅ | principal | Approve content |
| PATCH | /approval/:id/reject | ✅ | principal | Reject content |
| GET | /content/live/:teacherId | ❌ | - | Get active content |
| GET | /health | ❌ | - | Server status |

---

## 🎯 Next Steps

1. ✅ Import Postman collection
2. ✅ Test all endpoints locally
3. ✅ Fix any connection issues
4. ✅ Push to GitHub
5. ✅ Deploy on Railway
6. ✅ Test production endpoints
7. ✅ Monitor logs for errors
8. ✅ Set up backups (Railway + PostgreSQL backup)

