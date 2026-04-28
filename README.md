# Dynamic Certificate Generation & Verification System
### PERN Stack — PostgreSQL, Express.js, React.js, Node.js

---

## Setup Instructions

### 1. PostgreSQL Database
Create the database before starting the backend:
```sql
CREATE DATABASE certificates_db;
```

### 2. Backend
```bash
cd backend
# Edit .env and set your PostgreSQL password
npm install
npm run dev
```
Runs on: http://localhost:5000

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on: http://localhost:5173

---

## Features
- **Admin Dashboard** — stats overview and recent certificates
- **Issue Certificates** — dynamic form with type and category selection
- **Certificate Types** — admin can create/delete types dynamically
- **Categories** — manage categories (AI, Networking, Cloud, etc.)
- **PDF Download** — generates a styled PDF with QR code
- **Verification** — public page to verify any certificate by code or QR scan

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List all categories |
| POST | /api/categories | Create category |
| DELETE | /api/categories/:id | Delete category |
| GET | /api/certificate-types | List all types |
| POST | /api/certificate-types | Create type |
| DELETE | /api/certificate-types/:id | Delete type |
| GET | /api/certificates | List all certificates |
| POST | /api/certificates | Issue certificate |
| GET | /api/certificates/verify/:code | Verify by code |
| GET | /api/certificates/:id/download | Download PDF |
| DELETE | /api/certificates/:id | Delete certificate |
