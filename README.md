# DEIW Project

A modern full-stack web application featuring a dynamic React frontend and a high-performance FastAPI backend.

## 🚀 Tech Stack

### Frontend (`/inst`)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Radix UI Primitives
- **Animation**: Framer Motion
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router DOM

### Backend (`/backend`)
- **Framework**: FastAPI
- **Database ORM**: SQLAlchemy
- **Authentication**: JWT (OAuth2 with Password bearer)
- **Server**: Uvicorn

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.10+ recommended)

### 1. Backend Setup
The backend handles API requests, database operations, and authentication.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```
The backend API will be available at `http://localhost:8000`.
API Documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### 2. Frontend Setup
The frontend is a single-page application built with Vite.

```bash
# Navigate to the frontend directory
cd inst

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```
deiw/
├── backend/            # FastAPI Backend
│   ├── routers/        # API Routes
│   ├── main.py         # Application Entry Point
│   ├── models.py       # Database Models
│   ├── schemas.py      # Pydantic Schemas
│   └── database.py     # Database Connection
├── inst/               # React Frontend
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # Page Components
│   │   └── ...
│   └── package.json
└── README.md           # Project Documentation
```

## ✨ Features
- **Modern UI/UX**: Built with Radix UI and Tailwind for a polished look.
- **Service & Project Showcase**: Dynamic display of services and portfolio projects.
- **Authentication**: Secure login and registration flows.
- **Admin Management**: Capabilities for managing content (Admin/Cabinet).
