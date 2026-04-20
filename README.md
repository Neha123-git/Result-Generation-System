# Report Card System

Full-stack project for automated report card generation.

## Tech Stack
- Frontend: React + Vite
- Backend: Java Spring Boot API
- Database: PostgreSQL

## Modules Implemented
- Login and role-based access (Admin/Teacher)
- Teacher Excel upload for class data
- Filtered analytics (grade, gender, caste, sorting)
- Top performers and class summary
- PDF report generation

## Class Support
- FYBCS
- SYBCS
- TYBCS
- MCSI
- MScII

## Quick Start
### 1) Backend
```bash
cd backend
docker compose up -d
# ensure Java 17 + Maven are installed
mvn spring-boot:run
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default Accounts
- Admin: `admin / admin123`
- Teacher: `teacher1 / teacher123`

## Excel Format
Columns expected:
1. Student Name
2. Gender
3. Caste
4. Marks
5. Subject Code
