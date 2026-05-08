# Primetrade.ai — Task Management API

Scalable REST API with JWT authentication and role-based access control, built with Node.js, Express, Prisma, and PostgreSQL. Includes a React frontend for full-stack demonstration.

## Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Backend    | Node.js, Express.js                      |
| ORM        | Prisma                                   |
| Database   | PostgreSQL                               |
| Auth       | JWT (jsonwebtoken) + bcryptjs            |
| Validation | Joi                                      |
| API Docs   | Swagger (OpenAPI 3.0)                    |
| Frontend   | React 18 + Vite                          |
| Container  | Docker + Docker Compose                  |

## Quick Start (Docker — recommended)

```bash
git clone <repo-url>
cd primetrade
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Swagger docs: http://localhost:5000/api-docs

## Local Setup (without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL

npx prisma migrate dev --name init
node prisma/seed.js       # Creates demo users + tasks
npm run dev               # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## API Endpoints

All endpoints are versioned under `/api/v1`. Full interactive docs at `/api-docs`.

### Authentication

| Method | Endpoint               | Auth | Description         |
|--------|------------------------|------|---------------------|
| POST   | /api/v1/auth/register  | No   | Register new user   |
| POST   | /api/v1/auth/login     | No   | Login, get JWT      |
| GET    | /api/v1/auth/me        | JWT  | Get current user    |

### Tasks (CRUD)

| Method | Endpoint            | Auth  | Description                            |
|--------|---------------------|-------|----------------------------------------|
| GET    | /api/v1/tasks       | JWT   | List tasks (own for user, all for admin) |
| POST   | /api/v1/tasks       | JWT   | Create task                            |
| GET    | /api/v1/tasks/:id   | JWT   | Get task by ID                         |
| PUT    | /api/v1/tasks/:id   | JWT   | Update task                            |
| DELETE | /api/v1/tasks/:id   | JWT   | Delete task                            |

### Admin (role: ADMIN only)

| Method | Endpoint                        | Auth  | Description           |
|--------|---------------------------------|-------|-----------------------|
| GET    | /api/v1/admin/users             | Admin | List all users        |
| PATCH  | /api/v1/admin/users/:id/role    | Admin | Change user role      |

### Filters & Pagination

Tasks list supports query params: `?status=PENDING&priority=HIGH&page=1&limit=10`

## Demo Credentials

Seeded by `npm run prisma:seed`:

| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | admin@primetrade.ai     | Admin@123 |
| User  | user@primetrade.ai      | User@123  |

## Database Schema

```
User          Task
─────────     ──────────────
id (cuid)     id (cuid)
email         title
name          description
password      status (PENDING|IN_PROGRESS|COMPLETED|CANCELLED)
role          priority (LOW|MEDIUM|HIGH)
createdAt     userId (FK → User)
updatedAt     createdAt
              updatedAt
```

## Security

- **Password hashing**: bcryptjs with salt rounds = 12
- **JWT**: 24h expiry, signed with secret from environment
- **Rate limiting**: 100 req / 15 min per IP on all `/api/` routes
- **Helmet**: HTTP security headers
- **CORS**: Scoped to `CLIENT_URL` env variable
- **Input validation**: Joi schemas on all mutating endpoints
- **Ownership checks**: Users can only access/modify their own tasks

## Scalability Notes

### Horizontal Scaling
The API is stateless (JWT-based auth, no server-side sessions), making it trivially deployable behind a load balancer (nginx/AWS ALB). Each instance connects to the same PostgreSQL cluster.

### Caching (Redis — optional next step)
Add Redis for:
- Caching frequent read queries (`GET /tasks`, user profiles)
- Rate limiting store (replacing in-memory store for multi-instance deployments)
- Session blacklisting for JWT revocation

### Microservices Path
The codebase is already structured for extraction:
- `auth/` → Auth Service
- `tasks/` → Task Service  
- `admin/` → Admin Service

Each controller + route pair is fully independent and can be extracted to a separate service with its own database, communicating via REST or message queue (RabbitMQ/Kafka).

### Database
- Prisma migrations enable zero-downtime schema changes
- Add read replicas for scaling read-heavy workloads
- Connection pooling via PgBouncer for high concurrency

### Deployment
- Docker Compose for local/single-server deployments
- Kubernetes manifests can be added for cloud deployment (GKE, EKS)
- CI/CD: add GitHub Actions for test → build → push → deploy pipeline

## Environment Variables

| Variable       | Description                           | Default              |
|----------------|---------------------------------------|----------------------|
| DATABASE_URL   | PostgreSQL connection string          | required             |
| JWT_SECRET     | Secret key for signing JWT tokens     | required             |
| JWT_EXPIRES_IN | Token expiry duration                 | 24h                  |
| PORT           | Server port                           | 5000                 |
| NODE_ENV       | Environment                           | development          |
| CLIENT_URL     | Frontend URL for CORS                 | http://localhost:5173|
