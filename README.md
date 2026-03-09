# Armatrix Team Page — Full Stack Assignment

## Overview

This project implements a **Team Page for Armatrix**, consisting of a FastAPI backend and a Next.js frontend.

The application allows displaying, creating, editing, and deleting team members via a REST API. The frontend fetches this data and renders an animated, responsive team interface designed to resemble a modern robotics company website.

The goal of this implementation is to demonstrate:

- Full-stack engineering ability
- Clean API design
- Responsive UI implementation
- Thoughtful visual design
- Deployment of production-ready services

---

# Architecture

```
team-page-project
│
├── backend
│   ├── .venv
│   ├── app
│   │   ├── __pycache__
│   │   ├── data.json
│   │   ├── main.py
│   │   ├── models.py
│   │   └── storage.py
│   │
│   ├── README.md
│   └── requirements.txt
│
├── frontend
│   ├── components
│   │   ├── Header.jsx
│   │   ├── RobotAnimator.jsx
│   │   ├── TeamCard.jsx
│   │   ├── TeamForm.jsx
│   │   └── TeamModal.jsx
│   │
│   ├── pages
│   │   ├── _app.js
│   │   ├── index.js
│   │   └── team.js
│   │
│   ├── public
│   │
│   ├── styles
│   │   └── globals.css
│   │
│   ├── node_modules
│   ├── next.config.js
│   └── package.json
│
└── .gitignore
```

---

# Backend

**Framework:** FastAPI  
**Language:** Python

Responsibilities:

- Store team members
- Provide REST endpoints
- Handle CRUD operations

### API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| GET | `/team` | Fetch team members |
| GET | `/team/meta` | Pagination metadata |
| POST | `/team` | Add team member |
| PUT | `/team/{id}` | Update team member |
| DELETE | `/team/{id}` | Delete team member |

### Team Member Schema

```
id
name
role
bio
photo_url
linkedin
skills
created_at
updated_at
```

Data is stored **in-memory** for simplicity.

---

# Frontend

**Framework:** Next.js (React)

Features implemented:

- Responsive team grid
- Animated UI
- Modal profile view
- Add / edit / delete members
- Search functionality
- Pagination
- Robotic themed UI

UI design draws inspiration from the **Armatrix brand aesthetic** while maintaining creative freedom.

---

# Tech Stack

### Frontend

- React
- Next.js
- CSS animations
- SVG components

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

### Deployment

- Frontend → Vercel
- Backend → Render

---

# Local Setup

## Clone Repository

```bash
git clone https://github.com/naman-fr/armatrix_task.git
cd armatrix_task
```

---

# Backend Setup

Navigate to backend folder:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv .venv
```

Activate environment (Windows):

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run server:

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

API documentation:

```
http://localhost:8000/docs
```

---

# Frontend Setup

Navigate to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# Environment Variables

Create a file inside **frontend**

```
frontend/.env.local
```

Add:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

# Deployment

## Backend Deployment (Render)

1. Go to https://render.com
2. Create **New Web Service**
3. Connect GitHub repository
4. Configure:

```
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port 10000
```

After deployment you will get:

```
https://your-backend-name.onrender.com
```

Test:

```
https://your-backend-name.onrender.com/docs
```

---

## Frontend Deployment (Vercel)

1. Go to https://vercel.com
2. Import GitHub repository
3. Set root directory:

```
frontend
```

Add environment variable:

```
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
```

Deploy.

---

# Design Decisions

### In-Memory Backend Storage

Used for simplicity and faster setup for the assignment.

### Modular Frontend Components

The UI is broken into reusable components:

```
Header
TeamCard
TeamModal
TeamForm
RobotAnimator
```

### UI Design

The interface uses:

- futuristic gradients
- animated cards
- robotic UI elements
- subtle hover interactions

to reflect a robotics startup aesthetic.

---

# Possible Future Improvements

If expanded further the system could include:

- authentication
- PostgreSQL database
- image uploads
- role-based admin panel
- caching layer
- server-side rendering optimizations

---

# Live Links

Frontend

```
(https://armatrix-task.vercel.app)
```

Backend

```
(https://armatrix-task.onrender.com)
```

---

# Author

**Naman Gautam**
