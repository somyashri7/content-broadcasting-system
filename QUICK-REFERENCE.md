# CBS - Quick Command Reference

## 🚀 Local Development

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Verify all connections
npm run verify

# Create database tables
npm run db:migrate

# Seed test data
npm run db:seed

# Install dependencies
npm install

# Install a new package
npm install package-name
```

---

## 🧪 Testing with Curl

### Authentication
```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123","role":"teacher"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Content Upload
```bash
# Upload content (requires token)
curl -X POST http://localhost:5000/content/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Math Basics" \
  -F "subject=mathematics" \
  -F "description=Algebra intro" \
  -F "file=@path/to/file.pdf"
```

### Get Content
```bash
# Get my content
curl -X GET "http://localhost:5000/content/my" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get content by ID
curl -X GET "http://localhost:5000/content/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approval Workflow
```bash
# Get pending content (principal only)
curl -X GET http://localhost:5000/approval/pending \
  -H "Authorization: Bearer PRINCIPAL_TOKEN"

# Approve content
curl -X PATCH http://localhost:5000/approval/1/approve \
  -H "Authorization: Bearer PRINCIPAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Reject content
curl -X PATCH http://localhost:5000/approval/1/reject \
  -H "Authorization: Bearer PRINCIPAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rejection_reason":"Low quality"}'
```

### Public Broadcast
```bash
# Get live content for teacher (no auth required)
curl -X GET "http://localhost:5000/content/live/1?subject=mathematics"

# Health check
curl http://localhost:5000/health
```

---

## 🐘 PostgreSQL Commands

```bash
# Connect to local database
psql -h localhost -p 5433 -U postgres -d content_broadcasting

# List all databases
\l

# Connect to CBS database
\c content_broadcasting

# List all tables
\dt

# Describe users table
\d users

# Query users
SELECT * FROM users;

# Count content
SELECT COUNT(*) FROM content;

# Exit
\q
```

---

## 🚂 Railway Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link local project to Railway
railway link

# View logs
railway logs

# Run migration on Railway
railway run npm run db:migrate

# SSH into Railway container
railway shell

# View environment variables
railway variables

# Deploy
git push origin main
```

---

## 📮 Postman Workflow

1. **Import Collection**
   - File → Import → postman-collection.json

2. **Set Variables**
   - Click eye icon (top right) → Globals
   - Set base_url: http://localhost:5000

3. **Test Flow**
   ```
   1. POST /auth/register (teacher)
   2. Copy token → {{teacher_token}}
   3. POST /content/upload
   4. Copy content_id → {{content_id}}
   5. GET /approval/pending (use principal token)
   6. PATCH /approval/{{content_id}}/approve
   7. GET /content/live/{{teacher_id}}
   ```

---

## 🐛 Debugging

```bash
# Check Node version
node --version

# Check npm version
npm --version

# List running processes on port 5000
netstat -ano | findstr :5000  (Windows)
lsof -i :5000                 (Mac/Linux)

# Kill process on port 5000
taskkill /PID process_id /F   (Windows)
kill -9 process_id            (Mac/Linux)

# Check environment variables
echo %PORT%          (Windows)
echo $PORT           (Mac/Linux)

# Test database connection
node -e "const pool = require('./src/config/db'); pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows[0]); process.exit(); })"
```

---

## 📁 File Structure

```
src/
├── server.js                 # Main app entry
├── config/
│   └── db.js                # Database config
├── controllers/
│   ├── auth.controller.js
│   ├── content.controller.js
│   ├── approval.controller.js
│   └── broadcast.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── content.routes.js
│   ├── approval.routes.js
│   └── broadcast.routes.js
├── middlewares/
│   ├── auth.middleware.js
│   └── upload.middleware.js
├── models/
│   ├── migrate.js           # Create tables
│   └── seed.js              # Sample data
├── services/
│   └── scheduling.service.js
├── utils/
│   ├── jwt.js               # Token utilities
│   └── response.js          # Response formatter
└── uploads/                 # User files
```

---

## 🔗 API Endpoints Summary

| Method | Route | Auth | Role | Status |
|--------|-------|------|------|--------|
| POST | /auth/register | ❌ | - | Ready |
| POST | /auth/login | ❌ | - | Ready |
| GET | /auth/me | ✅ | Any | Ready |
| POST | /content/upload | ✅ | teacher | Ready |
| GET | /content/my | ✅ | teacher | Ready |
| GET | /content/:id | ✅ | any | Ready |
| GET | /approval/all | ✅ | principal | Ready |
| GET | /approval/pending | ✅ | principal | Ready |
| PATCH | /approval/:id/approve | ✅ | principal | Ready |
| PATCH | /approval/:id/reject | ✅ | principal | Ready |
| GET | /content/live/:teacherId | ❌ | - | Ready |
| GET | /health | ❌ | - | Ready |

---

## 🆘 Common Issues & Solutions

### PostgreSQL won't connect
```bash
# Check if PostgreSQL is running
# Windows: Services → Check PostgreSQL status
# Mac: brew services list
# Linux: sudo service postgresql status

# Port mismatch? Check .env
cat .env | grep DB_PORT
# Default: 5432, Your setup: 5433
```

### Port 5000 already in use
```bash
# Find and kill process
# Windows: netstat -ano | findstr :5000
# Then: taskkill /PID <pid> /F

# Or change PORT in .env
echo PORT=5001 >> .env
```

### "Table does not exist" error
```bash
# Run migration
npm run db:migrate

# Verify tables created
psql -d content_broadcasting -c "\dt"
```

### Token errors
```bash
# Copy full token from login response
# Include "Bearer " in Authorization header
# Check JWT_SECRET in .env matches server
```

### Files not uploading
```bash
# Create uploads directory
mkdir -p src/uploads

# Check permissions
ls -la src/uploads

# Verify in .env
cat .env | grep UPLOAD_DIR
```

---

## 📊 Useful Environment Setup

Create a `.env` file:
```bash
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=content_broadcasting
DB_USER=postgres
DB_PASSWORD=admin123
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=src/uploads
```

---

## 🎯 Testing Checklist

- [ ] `npm run verify` passes all checks
- [ ] `npm run db:migrate` creates tables
- [ ] `npm run dev` starts without errors
- [ ] Health endpoint responds
- [ ] Can register and login
- [ ] Can upload content
- [ ] Can approve/reject content
- [ ] Can get live broadcast
- [ ] File uploads appear in src/uploads/
- [ ] Postman collection tests pass

---

## 📚 Documentation Files

- **[TESTING-AND-DEPLOYMENT.md](TESTING-AND-DEPLOYMENT.md)** - Full Postman & Railway guide
- **[RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)** - Detailed Railway deployment steps
- **[architecture-notes.txt](architecture-notes.txt)** - System architecture
- **[README.md](README.md)** - Project overview

---

## 🚀 Quick Deploy Checklist

```bash
# 1. Test locally
npm run verify && npm run dev

# 2. Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Monitor Railway
railway logs

# 4. Run migration on Railway
railway run npm run db:migrate

# 5. Test production
curl https://your-app-url.railway.app/health
```

---

Good luck! 🎉

