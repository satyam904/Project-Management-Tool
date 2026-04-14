## Project Management Tool
A comprehensive, modern project management application supporting user authentication, interactive dashboards, dynamic task kanban boards, and robust team collaboration with Django 4.2+ on the backend and React 19/Vite on the frontend.

## Tech Stack
Backend: Django 4.2+, DRF, PostgreSQL, SimpleJWT
Frontend: React, TypeScript, Vite, Tailwind CSS, React Query, Zustand

## Prerequisites
- Python 3.10+
- Node 18+
- Docker + Docker Compose

## Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/development.txt
cp .env.example .env      # edit with your values
```

### Start Postgres
```bash
docker compose up -d db
# check it's healthy:
docker compose ps
```

### Run migrations
```bash
python manage.py migrate
```

### Start backend
```bash
python manage.py runserver 8000
```

### Frontend
```bash
cd frontend
pnpm install              # Or npm install depending on preference
cp .env.example .env      # VITE_API_URL=http://localhost:8000
pnpm run dev              # runs on http://localhost:5173 or similar
```

## Running Seed Data
```bash
cd backend
python manage.py seed
# Admin: admin@example.com / Admin@1234
# Users: any seeded email / Test@1234

python manage.py seed --count=3   # 3x more data
```

## Running Tests

Backend:
```bash
cd backend
python manage.py test apps.users apps.projects apps.tasks --verbosity=2
```

Frontend:
```bash
cd frontend
npm run test
npm run test -- --coverage
```

## Features
- JWT authentication (register, login, logout, token refresh)
- Project CRUD with soft delete
- Project member management with roles (owner, editor, viewer)
- Task CRUD with soft delete, priority, ordering
- Task comments
- Audit logging
- Pagination and search on projects
- Status and priority filters on tasks
- Responsive UI with complete Error Boundary and Skeleton loaders

## Known Limitations
- Email verification is modeled but not implemented (is_verified flag exists)
- No real-time updates (no WebSocket)
- File attachments not supported

## API Reference
**Auth**
- POST `/api/v1/auth/register/`
- POST `/api/v1/auth/login/`
- POST `/api/v1/auth/logout/`
- POST `/api/v1/auth/refresh/`
- GET `/api/v1/auth/me/`

**Projects**
- GET/POST `/api/v1/projects/`
- GET/PATCH/DELETE `/api/v1/projects/:id/`

**Tasks**
- GET/POST `/api/v1/tasks/`
- GET/PATCH/DELETE `/api/v1/tasks/:id/`
- GET/POST `/api/v1/tasks/:id/comments/`
