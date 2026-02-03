# Dr. Atif Shahzad - Learning & Research Platform

A full-stack web application for managing courses, research publications, and academic assessments. This platform provides comprehensive tools for students, faculty, and administrators to collaborate on educational content and track academic performance.

**Live URL**: https://dratifshahzad.com

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Database](#database)
- [Authentication](#authentication)

---

## 🎯 Project Overview

This is a modern educational platform built with a React frontend and Flask backend. It supports:

- **Course Management**: Create and manage courses with student enrollment
- **Research Integration**: Display ORCID publications and research work
- **NCAAA Compliance**: Track course learning outcomes and student performance metrics
- **Role-Based Access**: Admin, Faculty, Student, and Professor roles
- **Assessment Tools**: Quiz management and performance tracking

---

## ✨ Features

### For Students

- Browse available courses
- View enrolled courses and performance metrics
- Track quiz scores and course progress
- Access research and learning materials

### For Faculty/Professors

- Manage courses and students
- Create and manage quizzes
- Upload student assessment data via CSV
- Monitor student performance

### For Administrators

- Full course management (create, edit, delete)
- Manage NCAAA compliance courses
- Bulk import student data via CSV
- Faculty member management
- System configuration

### For Everyone

- User authentication and JWT-based session management
- Responsive mobile-first design
- Real-time research publication feed from ORCID
- Secure password management

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Data Fetching**: React Query (@tanstack/react-query)
- **Animations**: Framer Motion
- **Icons**: React Icons (HeroIcons)
- **Tables**: TanStack React Table
- **CSV Parsing**: Papa Parse
- **UI Components**: Material-UI (select components)

### Backend

- **Framework**: Flask 2.x
- **Database**: SQLAlchemy ORM with MySQL
- **Authentication**: JWT (Flask-JWT-Extended)
- **Password Hashing**: Flask-Bcrypt
- **CORS**: Flask-CORS
- **Rate Limiting**: Flask-Limiter
- **Database Migrations**: Flask-Migrate (Alembic)
- **API Documentation**: RESTful design

---

## 📁 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Flask app factory
│   │   ├── models/                  # SQLAlchemy models
│   │   │   ├── User.py              # User model with roles
│   │   │   ├── Course.py            # Course model
│   │   │   ├── NCAAA_Courses/       # NCAAA-specific courses
│   │   │   ├── Quiz.py              # Quiz model
│   │   │   ├── QuizMark.py          # Student quiz scores
│   │   │   ├── Professor.py         # Professor model
│   │   │   ├── OrcidWork.py         # Research publications
│   │   │   ├── RefreshToken.py      # Refresh token management
│   │   │   ├── TokenBlackList.py    # JWT blacklist
│   │   │   └── associations.py      # Student-Course relationship
│   │   ├── routes/                  # API blueprints
│   │   │   ├── auth.py              # Auth endpoints
│   │   │   ├── courses.py           # Course endpoints
│   │   │   ├── ncaaa_courses.py     # NCAAA endpoints
│   │   │   ├── about.py             # Research/ORCID endpoints
│   │   │   └── admin/               # Admin-only endpoints
│   │   ├── services/
│   │   │   ├── extenstions.py       # Flask extensions setup
│   │   │   └── utils.py             # Utility functions
│   │   └── migrations/              # Database migrations
│   ├── run.py                       # App entry point
│   └── requirements.txt             # Python dependencies

├── frontend/
│   ├── src/
│   │   ├── Components/              # React components
│   │   │   ├── Hero.jsx             # Landing hero section
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── Layout.jsx           # Main layout wrapper
│   │   │   ├── AuthComponents/      # Login/Signup forms
│   │   │   ├── CoursesComponents/   # Course pages
│   │   │   ├── AdminComponents/     # Admin dashboard
│   │   │   ├── NCAAA_Components/    # NCAAA pages
│   │   │   └── ncaaaDetailComponents/ # NCAAA detail pages
│   │   ├── Context/                 # React Context providers
│   │   │   ├── AuthContext.jsx      # Auth state
│   │   │   ├── CourseContext.jsx    # Course state
│   │   │   ├── NcaaCourseContext.jsx # NCAAA state
│   │   │   └── ResearchContext.jsx  # Research state
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js           # Auth hook
│   │   │   ├── useApi.js            # API client hook
│   │   │   ├── useNcaaa.js          # NCAAA data hook
│   │   │   └── useResearch.js       # Research data hook
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Entry point with routing
│   │   ├── App.css                  # Global styles
│   │   └── index.css                # Tailwind setup
│   ├── public/                      # Static assets
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   └── package.json                 # Node dependencies

├── .env.development                 # Dev environment variables
├── .env.production                  # Production environment variables
└── README.md                        # This file
```

---

## 🔌 API Endpoints

### Authentication Endpoints (`/api`)

| Method | Endpoint           | Description              | Auth Required      |
| ------ | ------------------ | ------------------------ | ------------------ |
| POST   | `/register`        | Create new user account  | ❌                 |
| POST   | `/login`           | Login and get JWT tokens | ❌                 |
| POST   | `/refresh`         | Refresh access token     | ✅ (refresh token) |
| GET    | `/me`              | Get current user info    | ✅                 |
| POST   | `/change-password` | Change user password     | ✅                 |
| POST   | `/logout`          | Logout and revoke tokens | ✅                 |

### Course Endpoints (`/api`)

| Method | Endpoint                                   | Description                    | Auth Required | Role  |
| ------ | ------------------------------------------ | ------------------------------ | ------------- | ----- |
| GET    | `/courses`                                 | Get all standard courses       | ❌            | Any   |
| GET    | `/user/courses/<uid>`                      | Get user's enrolled courses    | ✅            | Any   |
| GET    | `/ncaaa`                                   | Get all NCAAA courses          | ❌            | Any   |
| POST   | `/admin/add-course`                        | Create new course              | ✅            | Admin |
| GET    | `/admin/ncaaa/get-courses`                 | Get NCAAA courses (admin view) | ✅            | Admin |
| POST   | `/admin/ncaaa/add-course`                  | Create NCAAA course            | ✅            | Admin |
| DELETE | `/admin/ncaaa/delete-course/<course_code>` | Delete NCAAA course            | ✅            | Admin |

### Assessment Endpoints (`/api`)

| Method | Endpoint                        | Description             | Auth Required | Role  |
| ------ | ------------------------------- | ----------------------- | ------------- | ----- |
| POST   | `/admin/<course_id>/upload_csv` | Bulk upload quiz scores | ✅            | Admin |
| POST   | `/admin/select-data`            | Select assessment data  | ✅            | Admin |

### Research/ORCID Endpoints (`/api`)

| Method | Endpoint                       | Description                    | Auth Required |
| ------ | ------------------------------ | ------------------------------ | ------------- |
| GET    | `/orcid/researches`            | Get researcher's publications  | ❌            |
| GET    | `/orcid/researches/<put_code>` | Get single publication details | ❌            |

### Admin Endpoints (`/api`)

| Method | Endpoint                 | Description              | Auth Required | Role  |
| ------ | ------------------------ | ------------------------ | ------------- | ----- |
| GET    | `/admin/faculty-members` | List all faculty members | ✅            | Admin |

### Health Check (`/api`)

| Method | Endpoint     | Description                       |
| ------ | ------------ | --------------------------------- |
| GET    | `/`          | API health check                  |
| GET    | `/debug`     | Debug info                        |
| GET    | `/debug/dev` | Dev debug info (development only) |

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js**: v16 or higher
- **Python**: v3.8 or higher
- **MySQL**: v5.7 or higher
- **Git**: For version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/dratifshahzad.git
cd dratifshahzad
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env.development file (see Configuration section)
# Ensure MySQL is running and database is created

# Run database migrations
flask db upgrade

# Start development server
python run.py
```

Backend will be available at `http://localhost:5000/api`

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node dependencies
npm install

# Create .env.local file (see Configuration section)

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## ⚙️ Configuration

### Backend Configuration (`.env.development`)

```env
# Flask Environment
FLASK_ENV=development
FLASK_DEBUG=1

# Database
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/dratifshahzad

# Security Keys (generate with: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here

# CORS Origins (development)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174

# ORCID Configuration
ORCID_ID=0000-0003-2058-3648

# Port
PORT=5000
```

### Frontend Configuration (`.env.developement`)

```env
# API Base URL
VITE_API_BASE=http://localhost:5000/api
VITE_ENV=development
VITE_DEBUG=true
```

## 🏃 Running the Application

### Development Mode (Concurrent Frontend + Backend)

**Terminal 1 - Backend:**

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Then visit: `http://localhost:5173`

### Production Build

**Backend:**

```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**

```bash
cd frontend
npm run build
# Deploy dist/ folder to static hosting
```

---

## 🗄️ Database

### Database Schema Overview

#### Users Table

- User authentication and profile information
- Roles: ADMIN, STUDENT, FACULTY, PROFESSOR
- Password stored as bcrypt hash

#### Courses Table

- Standard course information
- Many-to-many relationship with Users (students)

#### NCAAA_Courses Table

- NCAAA-specific course tracking
- For accreditation and compliance

#### Quizzes Table

- Quiz information linked to courses

#### QuizMarks Table

- Student quiz scores
- Many-to-one relationship with Users and Quizzes

#### RefreshTokens Table

- JWT refresh token tracking
- Supports token revocation

#### TokenBlocklist Table

- Blacklisted JWT tokens for logout

### Create Database

```bash
# MySQL command line
mysql -u root -p

# Inside MySQL:
CREATE DATABASE dratifshahzad;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON dratifshahzad.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Run Migrations

```bash
cd backend
flask db upgrade  # Apply all migrations
flask db migrate -m "Add new field"  # Create new migration

flask db downgrade  # Rollback one migration
```

---

## 🔐 Authentication

### JWT Token Flow

1. **Registration/Login**: User credentials validated, JWT tokens generated
   - Access Token: 30-minute expiration (stored in HTTP-only cookie)
   - Refresh Token: 7-day expiration (stored in HTTP-only cookie)

2. **Protected Requests**: Access token sent automatically with each request
   - If expired, refresh token used to get new access token

3. **Logout**: Tokens added to blacklist, user cleared from frontend

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

### Rate Limiting

- Register: 10 requests per hour per IP
- Login: 10 requests per hour per IP
- Refresh: 10 requests per hour per IP

---

## 👥 User Roles & Permissions

### ADMIN

- ✅ Create/delete courses
- ✅ Manage NCAAA courses
- ✅ Upload CSV data
- ✅ View all faculty members
- ✅ Full system configuration

### FACULTY/PROFESSOR

- ✅ Create quizzes
- ✅ Manage enrolled students
- ✅ Upload assessment data

### STUDENT

- ✅ View enrolled courses
- ✅ View quiz scores
- ✅ Access course materials

---

## 📊 Data Import/Export

### CSV Format for Student Scores

```csv
KAUID,Quiz1,Quiz2,Quiz3
123456,95,87,92
234567,88,90,85
345678,92,94,89
```

**Headers**: KAUID (student ID) followed by quiz titles
**Rows**: Student ID and their corresponding scores

### Importing CSV

1. Navigate to Admin Dashboard
2. Select course from dropdown
3. Upload CSV file
4. System validates and imports data

---

## 🔗 ORCID Integration

The platform integrates with ORCID (Open Researcher and Contributor ID) to display research publications.

### Current Configuration

- **ORCID ID**: 0000-0003-2058-3648
- **Public API**: https://pub.orcid.org/v3.0/

### Available Data

- Publication title
- Publication type
- Publication year
- Journal name
- DOI
- URL
- Contributors

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**

```bash
# Check if port 5000 is in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Check MySQL connection
mysql -u username -p -h localhost

# Check environment variables
cat .env.development
```

**Frontend can't connect to API:**

```bash
# Check VITE_API_BASE in .env.local
# Check backend is running on correct port
# Check CORS configuration in backend

# Browser console should show network errors
```

**Database migrations fail:**

```bash
# Reset migrations (DEV ONLY!)
rm -rf backend/migrations/versions/*
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

---

## 📦 Dependencies

### Backend (Python)

- Flask==2.x
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-Bcrypt
- Flask-CORS
- Flask-Migrate
- Flask-Limiter
- mysql-connector-python / PyMySQL
- python-dotenv

### Frontend (Node.js)

- react@18
- react-router-dom@6
- axios
- tailwindcss
- react-query (@tanstack/react-query)
- framer-motion
- react-icons
- papaparse
- react-hook-form

---

## 📋 Checklist for Running Locally

- [ ] Clone repository
- [ ] Install Python 3.8+
- [ ] Install Node.js 16+
- [ ] Install MySQL 5.7+
- [ ] Create MySQL database
- [ ] Create `.env.development` file with database URL
- [ ] Create `.env.local` file in frontend
- [ ] Install backend dependencies: `pip install -r requirements.txt`
- [ ] Install frontend dependencies: `npm install`
- [ ] Run database migrations: `flask db upgrade`
- [ ] Start backend: `python run.py`
- [ ] Start frontend: `npm run dev`
- [ ] Visit `http://localhost:5173`

---

**Last Updated**: February 2026
