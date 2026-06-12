# 💼 WealthPilot AI — Personal Finance Manager

An AI-powered personal finance management application built with React, Spring Boot, FastAPI, and MySQL.

---

## What It Does

WealthPilot AI helps you track income and expenses, set budgets, plan financial goals, manage debts, monitor investments and insurance policies, and get AI-driven insights and spending forecasts — all from a single clean dashboard.

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

- App → http://localhost:3000
- Backend API → http://localhost:8080
- AI Service → http://localhost:8000

### Stop

```bash
docker-compose down
```

### Stop and reset database

```bash
docker-compose down -v
```

---

## Local Development (without Docker)

### 1. MySQL

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
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

## Features

| Module          | Description                                      |
|-----------------|--------------------------------------------------|
| Dashboard       | Net worth, income, expenses, cash flow, charts   |
| Transactions    | Add, edit, delete income and expense records     |
| Budget          | Set monthly spending limits per category         |
| Goals           | Track savings goals with monthly targets         |
| Debts           | Monitor loans, EMIs, repayment progress          |
| Investments     | Portfolio tracking with gain/loss analysis       |
| Insurance       | Policy tracking with renewal alerts              |
| AI Assistant    | Chat, expense forecasting, spending analysis     |
| Health Score    | 0–100 financial health score with breakdown      |

---

## API Endpoints

### Auth
| Method | Endpoint              | Description    |
|--------|-----------------------|----------------|
| POST   | /api/auth/register    | Register user  |
| POST   | /api/auth/login       | Login, get JWT |

### Dashboard
| Method | Endpoint       | Description             |
|--------|----------------|-------------------------|
| GET    | /api/dashboard | Full financial summary  |

### Transactions
| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| GET    | /api/transactions      | List all    |
| POST   | /api/transactions      | Create      |
| PUT    | /api/transactions/{id} | Update      |
| DELETE | /api/transactions/{id} | Delete      |

### Budgets / Goals / Debts / Investments / Insurance
All follow the same pattern:
`GET /api/{resource}` · `POST /api/{resource}` · `PUT /api/{resource}/{id}` · `DELETE /api/{resource}/{id}`

### AI
| Method | Endpoint         | Description           |
|--------|------------------|-----------------------|
| POST   | /api/ai/chat     | Ask the AI assistant  |
| GET    | /api/ai/forecast | Expense forecast      |
| GET    | /api/ai/analyze  | Spending analysis     |

---

## Financial Health Score

| Component           | Max Points |
|---------------------|------------|
| Savings Rate (>20%) | 25         |
| Debt Ratio (<36%)   | 25         |
| Emergency Fund      | 25         |
| Budget Discipline   | 15         |
| Goal Progress       | 10         |

Score: 0–100 · Excellent: 70+ · Fair: 40–69 · Needs Work: <40

---

## Security

- BCrypt password hashing
- JWT authentication (24h expiry)
- CORS restricted to frontend origin
- `@JsonIgnore` on all user relationships
- Input validation via Jakarta Bean Validation
- SQL Injection prevention via JPA parameterized queries
