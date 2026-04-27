# 📮 Postman Testing - Step by Step Guide

## 📋 Prerequisites

Before you start, ensure:
- [ ] Postman is installed ([postman.com](https://postman.com))
- [ ] Dev server is running: `npm run dev`
- [ ] Database tables created: `npm run db:migrate`
- [ ] Server shows: "🚀 Server running on http://localhost:5000"

---

## Step 1️⃣: Import Collection into Postman

### 1.1 Open Postman
- Launch the **Postman** application
- You'll see an empty workspace

### 1.2 Import Collection
1. Click **Import** button (top left)
2. Select **Upload Files**
3. Browse to: `postman-collection.json`
4. Click **Open**
5. Click **Import**

**Result:** You should see:
- New collection: "Content Broadcasting System API"
- Organized in 5 folders: Authentication, Content, Approval, Broadcasting, Health Check

---

## Step 2️⃣: Configure Environment Variables

### 2.1 Open Variables
1. Click the **eye icon** (top right) → **Globals**
2. You'll see a table with variables

### 2.2 Set Base URL
1. Find row: `base_url`
2. Current value: `http://localhost:5000`
3. **Leave it as is** (already configured)

### 2.3 Set Other Variables (Empty for Now)
Leave these empty - they'll populate automatically:
- `teacher_token` = (empty)
- `principal_token` = (empty)
- `content_id` = (empty)
- `teacher_id` = (empty)

**Save** by clicking anywhere outside the table or pressing Ctrl+S

---

## Step 3️⃣: Test Health Endpoint (Verification)

### 3.1 Open Health Check Request
1. In the collection panel (left), expand: **Health Check**
2. Click on **GET /health**

### 3.2 Send Request
1. You should see the request URL: `{{base_url}}/health`
2. Click the blue **Send** button (right of the URL)

### 3.3 Check Response
**Expected Status:** `200 OK` (green)

**Expected Response Body:**
```json
{
    "status": "ok",
    "timestamp": "2026-04-28T10:30:45.123Z"
}
```

**✅ If you see this, your server is working!**

---

## Phase 1: Authentication Testing

## Step 4️⃣: Register Teacher Account

### 4.1 Open Register Teacher Request
1. Expand folder: **Authentication**
2. Click: **Register Teacher**

### 4.2 Review Request Body
You should see:
```json
{
  "name": "John Teacher",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher"
}
```

**Optional:** Edit these values if you want different test data

### 4.3 Send Request
1. Click blue **Send** button
2. Wait for response (usually 1-2 seconds)

### 4.4 Check Response
**Expected Status:** `201 Created` (green)

**Expected Response:**
```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Teacher",
      "email": "teacher@example.com",
      "role": "teacher",
      "created_at": "2026-04-28T10:30:45.123Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4.5 Save Teacher Token

**Important:** You need to copy this token for next requests

1. In the **Response** section, find: `"token": "eyJhbGc..."`
2. **Copy the entire token value** (the long string)
3. Click **eye icon** (top right) → **Globals**
4. Find row: `teacher_token`
5. Paste the token in the **CURRENT VALUE** column
6. **Save**

**Alternative - Auto-capture:**
Postman can auto-capture tokens (Advanced users)

---

## Step 5️⃣: Register Principal Account

### 5.1 Open Register Principal Request
1. In **Authentication** folder
2. Click: **Register Principal**

### 5.2 Send Request
1. Click blue **Send** button

### 5.3 Check Response
**Expected Status:** `201 Created`

**Expected Response:** Similar to teacher, but with `"role": "principal"`

### 5.4 Save Principal Token
1. Copy the `token` from response
2. Click **eye icon** → **Globals**
3. Find: `principal_token`
4. Paste the token in **CURRENT VALUE**
5. **Save**

---

## Step 6️⃣: Login Teacher (Optional Verification)

### 6.1 Open Login Teacher Request
1. In **Authentication** folder
2. Click: **Login Teacher**

### 6.2 Review Request Body
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

### 6.3 Send Request
1. Click blue **Send** button

### 6.4 Check Response
**Expected Status:** `200 OK`

Should return same token as before

---

## Phase 2: Content Upload Testing

## Step 7️⃣: Upload Content (Teacher)

### 7.1 Open Upload Content Request
1. Expand folder: **Content**
2. Click: **Upload Content**

### 7.2 Review Request Details
**Method:** POST  
**URL:** `{{base_url}}/content/upload`  
**Auth Header:** `Authorization: Bearer {{teacher_token}}`  
**Body Type:** form-data (file upload)

### 7.3 Set Form Data
In the **Body** tab, you should see:
- `title` = "Mathematics Basics"
- `subject` = "mathematics"
- `description` = "Introduction to algebra and equations"
- `start_time` = "2026-04-28T09:00:00Z"
- `end_time` = "2026-04-28T10:00:00Z"
- `rotation_duration` = "5"
- `file` = (empty - needs a file)

### 7.4 Select a File

**Very Important:** You need to upload a real file

1. In the **Body** tab, find the `file` row
2. Click on the **file** input field (on the right)
3. A file browser will open
4. Select any file:
   - PDF file (.pdf) ✅ Recommended
   - Image (.jpg, .png)
   - Word doc (.docx)
   - Any file up to 10MB

### 7.5 Send Request
1. Click blue **Send** button
2. Wait for upload (might take 2-3 seconds if large file)

### 7.6 Check Response
**Expected Status:** `201 Created`

**Expected Response:**
```json
{
  "success": true,
  "message": "Content uploaded successfully",
  "data": {
    "id": 1,
    "title": "Mathematics Basics",
    "subject": "mathematics",
    "file_url": "/uploads/filename_12345.pdf",
    "status": "pending",
    "uploaded_by": 1,
    "created_at": "2026-04-28T10:30:45.123Z"
    ...
  }
}
```

### 7.7 Save Content ID
1. Find `"id"` in the response (e.g., `"id": 1`)
2. Click **eye icon** → **Globals**
3. Find: `content_id`
4. Paste the ID (just the number, e.g., `1`)
5. **Save**

---

## Step 8️⃣: Get My Content (Teacher)

### 8.1 Open Get My Content Request
1. In **Content** folder
2. Click: **Get My Content**

### 8.2 Send Request
1. Click blue **Send** button

### 8.3 Check Response
**Expected Status:** `200 OK`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Mathematics Basics",
      "subject": "mathematics",
      "status": "pending",
      "uploaded_by": 1,
      ...
    }
  ]
}
```

**✅ Should show the content you just uploaded**

---

## Step 9️⃣: Get Content By ID

### 9.1 Open Get Content By ID Request
1. In **Content** folder
2. Click: **Get Content By ID**

### 9.2 Check URL
Should be: `{{base_url}}/content/{{content_id}}`

Postman will replace `{{content_id}}` with the ID you saved (e.g., 1)

### 9.3 Send Request
1. Click blue **Send** button

### 9.4 Check Response
**Expected Status:** `200 OK`

**Expected Response:** Full details of the content

---

## Phase 3: Approval Workflow Testing

## Step 🔟: Get Pending Content (Principal)

### 10.1 Open Get Pending Content Request
1. Expand folder: **Approval**
2. Click: **Get Pending Content**

### 10.2 Review Request Details
**Auth Header:** Uses `{{principal_token}}` (not teacher token!)

### 10.3 Send Request
1. Click blue **Send** button

### 10.4 Check Response
**Expected Status:** `200 OK`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Mathematics Basics",
      "status": "pending",
      "uploaded_by": 1,
      "teacher_name": "John Teacher",
      "teacher_email": "teacher@example.com",
      ...
    }
  ]
}
```

**✅ Should show the content uploaded by teacher**

---

## Step 1️⃣1️⃣: Get All Content (Principal)

### 11.1 Open Get All Content Request
1. In **Approval** folder
2. Click: **Get All Content**

### 11.2 Check Query Parameters
In the **Params** tab, you should see:
- `status` = "pending"
- `subject` = "mathematics"

These are optional filters. You can edit or remove them.

### 11.3 Send Request
1. Click blue **Send** button

### 11.4 Check Response
**Expected Status:** `200 OK`

Should show all content with applied filters

---

## Step 1️⃣2️⃣: Approve Content (Principal)

### 12.1 Open Approve Content Request
1. In **Approval** folder
2. Click: **Approve Content**

### 12.2 Check URL
Should be: `{{base_url}}/approval/{{content_id}}/approve`

Will use the content_id you saved

### 12.3 Check Request Body
Should be empty: `{}`

### 12.4 Send Request
1. Click blue **Send** button

### 12.5 Check Response
**Expected Status:** `200 OK`

**Expected Response:**
```json
{
  "success": true,
  "message": "Content approved",
  "data": {
    "id": 1,
    "status": "approved",  ← Changed from "pending"
    "approved_by": 2,
    "approved_at": "2026-04-28T10:30:45.123Z",
    ...
  }
}
```

**✅ Status should change to "approved"**

---

## Step 1️⃣3️⃣: Upload Another Content (For Rejection Test)

### 13.1 Upload Content Again
1. Go back to **Content** folder
2. Click: **Upload Content**
3. **Optional:** Change the title (e.g., "Science Basics")
4. Select a file again
5. Click **Send**

### 13.2 Save New Content ID
1. Copy the new `id` from response
2. **Temporarily replace** `{{content_id}}` in Globals with this new ID
3. **Save**

---

## Step 1️⃣4️⃣: Reject Content (Principal)

### 14.1 Open Reject Content Request
1. In **Approval** folder
2. Click: **Reject Content**

### 14.2 Check Request Body
Should be:
```json
{
  "rejection_reason": "Content does not meet quality standards"
}
```

**Optional:** Edit the reason to something custom

### 14.3 Send Request
1. Click blue **Send** button

### 14.4 Check Response
**Expected Status:** `200 OK`

**Expected Response:**
```json
{
  "success": true,
  "message": "Content rejected",
  "data": {
    "id": 2,
    "status": "rejected",  ← Changed to "rejected"
    "rejection_reason": "Content does not meet quality standards",
    ...
  }
}
```

**✅ Status should change to "rejected"**

---

## Phase 4: Broadcasting (Public) Testing

## Step 1️⃣5️⃣: Save Teacher ID

Before testing the broadcast endpoint, you need the teacher's user ID.

### 15.1 Where to Get Teacher ID
1. From **Step 4** (Register Teacher response)
2. Look for: `"id": 1` in the user object
3. Click **eye icon** → **Globals**
4. Find: `teacher_id`
5. Paste the ID (e.g., `1`)
6. **Save**

---

## Step 1️⃣6️⃣: Get Live Content (Public - No Auth Required)

### 16.1 Open Get Live Content Request
1. Expand folder: **Broadcasting**
2. Click: **Get Live Content (Public)**

### 16.2 Check URL
Should be: `{{base_url}}/content/live/{{teacher_id}}?subject=mathematics`

### 16.3 Review - No Authorization Header!
**Important:** This is a public endpoint - no token needed!

### 16.4 Send Request
1. Click blue **Send** button

### 16.5 Check Response
**Expected Status:** `200 OK`

**Expected Response:**
```json
{
  "success": true,
  "message": "Live content fetched",
  "data": [
    {
      "id": 1,
      "title": "Mathematics Basics",
      "subject": "mathematics",
      "status": "approved",  ← Only approved content shows!
      "file_url": "/uploads/filename.pdf",
      ...
    }
  ]
}
```

**✅ Should only show APPROVED content**
- Rejected content: NOT shown
- Pending content: NOT shown
- Approved content: SHOWN

---

## 🎯 Complete Test Summary

| Step | Request | Status | Purpose |
|------|---------|--------|---------|
| 3 | GET /health | 200 | Server check |
| 4 | POST /auth/register (teacher) | 201 | Register teacher |
| 5 | POST /auth/register (principal) | 201 | Register principal |
| 6 | POST /auth/login | 200 | Verify login |
| 7 | POST /content/upload | 201 | Upload content |
| 8 | GET /content/my | 200 | List my content |
| 9 | GET /content/:id | 200 | Get details |
| 10 | GET /approval/pending | 200 | Principal sees pending |
| 11 | GET /approval/all | 200 | Get all content |
| 12 | PATCH /approval/:id/approve | 200 | Approve content |
| 13 | POST /content/upload | 201 | Upload another |
| 14 | PATCH /approval/:id/reject | 200 | Reject content |
| 16 | GET /content/live/:teacherId | 200 | Public broadcast |

---

## ✅ Success Criteria

All tests passed if:
- ✅ All responses are green (200/201 status)
- ✅ No error messages
- ✅ Response bodies contain expected data
- ✅ Tokens work across requests
- ✅ Approved content appears in broadcast
- ✅ Rejected content doesn't appear in broadcast

---

## 🆘 Troubleshooting

### 401 Unauthorized
**Problem:** "Invalid or expired token"  
**Solution:**
1. Re-copy the token from login/register response
2. Make sure you're using `{{teacher_token}}` or `{{principal_token}}`
3. Verify token is in Globals

### 404 Not Found
**Problem:** "Route not found"  
**Solution:**
1. Check base_url is correct: `http://localhost:5000`
2. Verify server is running: `npm run dev`

### EADDRINUSE
**Problem:** "Port 5000 already in use"  
**Solution:**
```bash
# Kill the process
taskkill /PID [process_id] /F

# Or use different port
# Change PORT in .env to 5001
```

### File Upload Error
**Problem:** "File is required" or upload fails  
**Solution:**
1. Make sure you selected a file in Step 7.4
2. File size < 10MB
3. Check uploads directory exists: `src/uploads/`

### Variables Not Updating
**Problem:** `{{variable}}` not being replaced  
**Solution:**
1. Make sure you saved in Globals (eye icon → Globals)
2. The collection must use `{{variable_name}}` syntax
3. Refresh/reload the request

---

## 💡 Pro Tips

1. **Copy Token Faster**
   - In response, click the token value
   - It auto-copies to clipboard
   - Then paste in Globals

2. **Use Multiple Tabs**
   - Keep one tab on Globals (eye icon)
   - Test in another tab
   - Quickly update variables

3. **Pre-populate Test Data**
   - Change request bodies before sending
   - Use different emails each time
   - Create multiple test scenarios

4. **Monitor Server Logs**
   - Keep `npm run dev` terminal visible
   - Watch logs for errors/debug info
   - Helps troubleshoot issues

5. **Test Order Matters**
   - Follow steps in order
   - Each step depends on previous data
   - Don't skip steps

---

## 🎉 You've Successfully Tested!

Once all 16 steps complete successfully, your CBS application is:
- ✅ Receiving requests correctly
- ✅ Processing uploads
- ✅ Managing approvals
- ✅ Broadcasting content
- ✅ **Ready for production deployment!**

---

## 🚀 Next Steps

After successful Postman testing:
1. Read: [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)
2. Deploy to Railway
3. Switch Postman `base_url` to production URL
4. Test against production

---

**Good luck with your testing! 🎊**

