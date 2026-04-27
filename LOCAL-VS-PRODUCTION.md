# 🚀 Testing Local vs Production

## Your URLs

**Local Development:**
```
http://localhost:5000
```

**Production (Railway):**
```
https://content-broadcasting-system-production.up.railway.app
```

---

## 📮 Switch Between URLs in Postman

### Option 1: Using the `base_url` Variable
1. Click the **eye icon** (top right) → **Globals**
2. Find `base_url` variable
3. Change value between:
   - `http://localhost:5000` (local)
   - `https://content-broadcasting-system-production.up.railway.app` (production)
4. Save and all requests will use the new URL

### Option 2: Pre-configured Variables
Already configured in your collection:
- `{{local_url}}` = http://localhost:5000
- `{{production_url}}` = https://content-broadcasting-system-production.up.railway.app

You can manually update `base_url` to either of these values.

---

## 🧪 Testing Workflow

### For Local Testing
1. Ensure server is running: `npm run dev`
2. In Postman, set `base_url` to `http://localhost:5000`
3. Test endpoints as usual

### For Production Testing
1. Ensure Railway app is deployed and running
2. In Postman, set `base_url` to `https://content-broadcasting-system-production.up.railway.app`
3. **Note:** Authentication tokens are environment-specific
   - Login on production to get production tokens
   - Login locally to get local tokens
   - Don't mix tokens between environments

---

## ✅ Testing Both Environments

### Complete Test Flow (Local First)

**Step 1: Test Local**
```
1. base_url = http://localhost:5000
2. POST /health → Should return 200
3. POST /auth/register → Get local token
4. POST /content/upload → Test upload
5. GET /approval/pending → Test approval flow
```

**Step 2: Test Production**
```
1. base_url = https://content-broadcasting-system-production.up.railway.app
2. POST /health → Should return 200
3. POST /auth/register → Get production token (different from local!)
4. POST /content/upload → Test upload
5. GET /approval/pending → Test approval flow
```

---

## 📊 Sample Postman Setup

### Globals Variables
```
| Variable      | Local Value                    | Prod Value                                       |
|---------------|--------------------------------|--------------------------------------------------|
| base_url      | http://localhost:5000          | https://content-broadcasting...production.up... |
| teacher_token | (from local login)             | (from production login)                          |
```

---

## 🎯 Important Notes

1. **Tokens are Environment-Specific**
   - Don't use local tokens on production
   - Don't use production tokens locally
   - Get new tokens when switching environments

2. **File Uploads**
   - Local: Files stored in `src/uploads/`
   - Production: Files stored in Railway volumes (if configured)

3. **Database is Different**
   - Local: Your PostgreSQL database
   - Production: Railway PostgreSQL database
   - Data won't sync between them

4. **Test Scenarios**
   - Use different email addresses for local vs production
   - Or use same emails but they'll be separate users in each database

---

## 🔄 Quick Switch Script

To quickly switch `base_url` in Postman:
1. Open **Globals** (eye icon → Globals)
2. Find `base_url` row
3. Double-click the value to edit
4. Paste new URL
5. Click outside to save

Changes take effect immediately on all requests.

---

## 🚀 Ready to Test?

**For Local Testing:**
```bash
npm run dev
# Then switch Postman base_url to: http://localhost:5000
```

**For Production Testing:**
```
# Ensure Railway app is deployed
# Switch Postman base_url to: https://content-broadcasting-system-production.up.railway.app
```

---

## 📝 Example Request Comparison

### Local Request
```
POST http://localhost:5000/auth/login
```

### Production Request
```
POST https://content-broadcasting-system-production.up.railway.app/auth/login
```

Everything else in the request (headers, body) stays the same - only the base URL changes!

