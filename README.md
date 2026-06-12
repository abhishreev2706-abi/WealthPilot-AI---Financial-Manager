# 💼 WealthPilot AI — Personal Financial Operating System

An AI-powered financial management platform built with React, Spring Boot, FastAPI, and MySQL.

---

## Architecture

```
React (port 3000)
    ↓ HTTP / Axios
Spring Boot (port 8080)
    ↓ JPA
MySQL (port 3306)

Spring Boot
    ↓ REST
FastAPI AI Service (port 8000)
```

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Tailwind CSS, Recharts    |
| Backend    | Spring Boot 3.2, Spring Security    |
| Auth       | JWT (jjwt 0.11.5)                   |
| Database   | MySQL 8.0                           |
| AI Service | Python FastAPI, NumPy, Scikit-learn |
| Deploy     | Docker, Docker Compose              |

---

## Quick Start (Docker)

### Prerequisites
- Docker Desktop installed and running
- Ports 3000, 8080, 8000, 3306 must be free

### Run the full stack

```bash
docker-compose up --build
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8080
- AI Service → http://localhost:8000
- MySQL → localhost:3306

### Stop

```bash
docker-compose down
```

### Stop and remove volumes (reset DB)

```bash
docker-compose down -v
```

---

## Local Development (without Docker)

### 1. MySQL

Create the database and run the schema:

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
# Set environment variables or edit application.yml
mvn spring-boot:run
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

---

## API Endpoints

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/register    | Register user     |
| POST   | /api/auth/login       | Login, get JWT    |

### Dashboard
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/dashboard        | Full financial overview  |

### Transactions
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/transactions         | List all             |
| POST   | /api/transactions         | Create               |
| PUT    | /api/transactions/{id}    | Update               |
| DELETE | /api/transactions/{id}    | Delete               |

### Budgets
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| GET    | /api/budgets        | Current month       |
| POST   | /api/budgets        | Set budget          |
| PUT    | /api/budgets/{id}   | Update limit        |
| DELETE | /api/budgets/{id}   | Remove              |

### Goals
| Method | Endpoint          | Description  |
|--------|-------------------|--------------|
| GET    | /api/goals        | List all     |
| POST   | /api/goals        | Create       |
| PUT    | /api/goals/{id}   | Update       |
| DELETE | /api/goals/{id}   | Delete       |

### Debts
| Method | Endpoint          | Description  |
|--------|-------------------|--------------|
| GET    | /api/debts        | List all     |
| POST   | /api/debts        | Add debt     |
| PUT    | /api/debts/{id}   | Update       |
| DELETE | /api/debts/{id}   | Delete       |

### Investments
| Method | Endpoint               | Description  |
|--------|------------------------|--------------|
| GET    | /api/investments       | Portfolio    |
| POST   | /api/investments       | Add          |
| PUT    | /api/investments/{id}  | Update       |
| DELETE | /api/investments/{id}  | Delete       |

### Insurance
| Method | Endpoint              | Description  |
|--------|-----------------------|--------------|
| GET    | /api/insurance        | All policies |
| POST   | /api/insurance        | Add policy   |
| PUT    | /api/insurance/{id}   | Update       |
| DELETE | /api/insurance/{id}   | Delete       |

### AI
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| POST   | /api/ai/chat        | Ask AI assistant         |
| GET    | /api/ai/forecast    | Expense forecast         |
| GET    | /api/ai/analyze     | Spending behavior        |

### Notifications
| Method | Endpoint                       | Description     |
|--------|--------------------------------|-----------------|
| GET    | /api/notifications             | List all        |
| PUT    | /api/notifications/{id}/read   | Mark as read    |

---

## User Roles

| Role      | Description                    |
|-----------|--------------------------------|
| USER      | Individual user (default)      |
| FAMILY    | Family account                 |
| FREELANCER| Freelancer / self-employed     |
| BUSINESS  | Business owner                 |
| ADMIN     | Administrator                  |

---

## Financial Health Score

Calculated from 5 weighted components:

| Component             | Weight |
|-----------------------|--------|
| Savings Rate (>20%)   | 25 pts |
| Debt Ratio (<36%)     | 25 pts |
| Emergency Fund        | 25 pts |
| Budget Discipline     | 15 pts |
| Goal Progress         | 10 pts |

Score Range: 0–100 · Excellent: 70+ · Fair: 40–69 · Needs Work: <40

---

## Security

- Passwords hashed with BCrypt
- JWT tokens (24h expiry) on all protected routes
- CORS restricted to frontend origin
- `@JsonIgnore` on all User relationships to prevent data leakage
- Input validation on all DTOs via Jakarta Bean Validation
- SQL Injection prevented via JPA parameterized queries

---

## Development Phases

| Phase | Features                                              | Status |
|-------|-------------------------------------------------------|--------|
| 1     | Auth, Transactions, Dashboard, Budget                 | ✅ Done |
| 2     | Goals, Debts, Investments, Insurance, Health Score    | ✅ Done |
| 3     | AI Chat, Spending Analysis, Forecasting               | ✅ Done |
| 4     | Notifications, Audit Logging, Enterprise features     | 🔜 Next |

---

## Future Scalability

- Add Redis caching for dashboard queries
- Switch to OAuth2 / SSO for enterprise users
- Add WebSocket for real-time notifications
- Migrate AI service to dedicated ML models (LLM integration)
- Multi-currency support via exchange rate API
- Mobile app via React Native
- Deploy on AWS ECS + RDS + ElastiCache
