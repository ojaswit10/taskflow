# TaskFlow - Task Management Application

A production-ready Task Management Application built with Next.js, PostgreSQL (Neon), and Prisma.

## Live Demo
https://taskflow-three-nu.vercel.app/
---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma 7
- **Authentication:** JWT (HTTP-only cookies)
- **Security:** bcryptjs (password hashing), AES-256-CBC (payload encryption)

---

## Architecture
```
src/
  app/
    api/
      auth/
        me/        → GET current user
        signin/    → POST login
        signout/   → POST logout
        signup/    → POST register
      tasks/
        route.ts        → GET (list) + POST (create)
        [id]/route.ts   → GET, PUT, DELETE single task
    dashboard/     → Protected task management UI
    signin/        → Login page
    signup/        → Register page
  lib/
    auth.ts        → JWT + bcrypt utilities
    prisma.ts      → Prisma client singleton
    encryption.ts  → AES-256-CBC encrypt/decrypt
  middleware.ts    → Route protection
```

---

## Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT stored in **HTTP-only cookies** (not accessible via JS)
- Task title and description **encrypted with AES-256-CBC** before storing in DB
- Middleware protects all routes except `/signin`, `/signup`, and auth API routes
- Each user can only access their own tasks (authorization check on every request)
- Environment variables used for all secrets

---

## Database Schema
```prisma
model User {
  id        String   @id @default(uuid())
  fullName  String
  email     String   @unique
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}

model Task {
  id          String     @id @default(uuid())
  title       String     // AES encrypted
  description String?    // AES encrypted
  status      TaskStatus @default(PENDING)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root:
```env
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 4. Run database migrations
```bash
npx prisma migrate dev
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Documentation

### Auth

#### POST /api/auth/signup
```json
// Request
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response 201
{
  "success": true,
  "user": { "id": "uuid", "fullName": "John Doe", "email": "john@example.com" }
}
```

#### POST /api/auth/signin
```json
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response 200
{
  "success": true,
  "user": { "id": "uuid", "fullName": "John Doe", "email": "john@example.com" }
}
```

#### POST /api/auth/signout
```json
// Response 200
{ "success": true }
```

#### GET /api/auth/me
```json
// Response 200
{
  "success": true,
  "user": { "id": "uuid", "fullName": "John Doe", "email": "john@example.com", "createdAt": "..." }
}
```

---

### Tasks

#### GET /api/tasks
Query params: `page`, `limit`, `status`, `search`
```json
// Response 200
{
  "tasks": [
    {
      "id": "uuid",
      "title": "My Task",
      "description": "Task description",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST /api/tasks
```json
// Request
{
  "title": "New Task",
  "description": "Optional description",
  "status": "PENDING"
}

// Response 201
{
  "task": { "id": "uuid", "title": "New Task", "description": "...", "status": "PENDING", "createdAt": "..." }
}
```

#### PUT /api/tasks/:id
```json
// Request
{
  "title": "Updated Title",
  "status": "IN_PROGRESS"
}

// Response 200
{
  "task": { "id": "uuid", "title": "Updated Title", "status": "IN_PROGRESS", ... }
}
```

#### DELETE /api/tasks/:id
```json
// Response 200
{ "message": "Task deleted successfully" }
```

---

## Deployment

Deployed on **Vercel** with environment variables configured in the Vercel dashboard.
