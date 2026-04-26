# Content Broadcasting System 📡

A backend system for distributing educational content from teachers to students via a public broadcasting API.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Auth**: JWT + bcryptjs
- **File Upload**: Multer (local storage)
- **Rate Limiting**: express-rate-limit

---

## Project Structure

```
src/
├── server.js
├── config/       → DB connection
├── controllers/  → Route handlers
├── routes/       → Express routers
├── services/     → Scheduling logic
├── middlewares/  → Auth, upload
├── models/       → Migration, seed
└── utils/        → JWT, response helpers
architecture-notes.txt
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- PostgreSQL v14+

### 2. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/content-broadcasting-system.git
cd content-broadcasting-system
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your PostgreSQL credentials and a strong JWT_SECRET.

### 4. Create the database
Open psql and run:
```sql
CREATE DATABASE content_broadcasting;
```

### 5. Run migrations
```bash
npm run db:migrate
```

### 6. Seed default users
```bash
npm run db:seed
```
This creates:
| Email | Password | Role |
|---|---|---|
| principal@school.com | principal123 | principal |
| teacher1@school.com | teacher123 | teacher |
| teacher2@school.com | teacher123 | teacher |

### 7. Start the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```
Server runs at **http://localhost:5000**

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | None | Register user |
| POST | /auth/login | None | Login & get token |
| GET | /auth/me | JWT | Get current user |

**POST /auth/login**
```json
{ "email": "teacher1@school.com", "password": "teacher123" }
```
Response:
```json
{ "success": true, "data": { "user": {...}, "token": "eyJ..." } }
```

---

### Content (Teacher)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /content/upload | Teacher JWT | Upload content file |
| GET | /content/my | Teacher JWT | View own content |
| GET | /content/:id | JWT | View single content |

**POST /content/upload** (multipart/form-data)
```
title          : "Maths Chapter 1"    (required)
file           : <image file>          (required, jpg/png/gif, max 10MB)
subject        : "maths"              (required)
description    : "..."                (optional)
start_time     : "2026-04-25T09:00:00Z"  (optional, ISO 8601)
end_time       : "2026-04-25T17:00:00Z"  (optional, ISO 8601)
rotation_duration : 5                 (optional, minutes, default 5)
```

---

### Approval (Principal)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /approval/all | Principal JWT | All content (filterable) |
| GET | /approval/pending | Principal JWT | Pending content only |
| PATCH | /approval/:id/approve | Principal JWT | Approve content |
| PATCH | /approval/:id/reject | Principal JWT | Reject with reason |

**PATCH /approval/:id/reject**
```json
{ "rejection_reason": "Image quality too low" }
```

**GET /approval/all** — Query params:
- `?status=pending` or `approved` or `rejected`
- `?subject=maths`
- `?teacher_id=2`

---

### Public Broadcasting (Students — No Auth)

| Method | Endpoint | Description |
|---|---|---|
| GET | /content/live/:teacherId | Get active content for a teacher |
| GET | /content/live/:teacherId?subject=maths | Filter by subject |

**Response (content available):**
```json
{
  "success": true,
  "message": "Live content fetched",
  "data": [
    {
      "id": 1,
      "title": "Maths Chapter 1",
      "subject": "maths",
      "file_url": "/uploads/1234567890-abc.jpg",
      "file_type": "image/jpeg",
      "start_time": "2026-04-25T09:00:00Z",
      "end_time": "2026-04-25T17:00:00Z",
      "rotation_duration": 5
    }
  ]
}
```

**Response (no content):**
```json
{ "success": true, "message": "No content available", "data": [] }
```

---

## Scheduling Logic

Content rotates per-subject based on time:

1. Only approved content with a valid `start_time`/`end_time` window is eligible
2. Items are ordered by `rotation_order` within each subject
3. Epoch = earliest `start_time` among active items
4. `elapsed_minutes = floor((NOW - epoch) / 60000)`
5. `position = elapsed_minutes % total_cycle_duration`
6. Walk the list to find which item owns that position → that item is live

Example — Maths has 3 items (5 min each):
```
Minute 0–4:  Content A
Minute 5–9:  Content B
Minute 10–14: Content C
Minute 15–19: Content A (loops)
```

---

## Edge Cases

| Case | Behaviour |
|---|---|
| No approved content | Returns "No content available" |
| Approved but no start/end time | Not eligible, treated as inactive |
| Approved, time window passed | Excluded from results |
| Invalid teacher ID | Returns "No content available" |
| Unknown subject | Returns "No content available" |
| Wrong file type | 400 error with message |
| File > 10MB | 400 error with message |
| Reject without reason | 400 error |
| Teacher accessing other's content | 403 Forbidden |

---

## Assumptions & Decisions
- `start_time` and `end_time` are required for content to be broadcastable (by design)
- Subject names are normalized to lowercase
- One slot per (subject, teacher) pair
- Rotation order is assigned at upload time (first-come first-served)
- Re-uploading rejected content is out of scope for MVP
