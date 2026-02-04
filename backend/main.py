from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import auth, admin, contact
import os

# Create Database Tables
Base.metadata.create_all(bind=engine)

def create_default_superuser():
    db = database.SessionLocal()
    try:
        if not db.query(models.User).filter(models.User.username == "root").first():
            user = models.User(
                username="root",
                hashed_password=utils.get_password_hash("root"),
                is_superuser=True,
                is_active=True,
                vorname="Admin",
                nachname="Root",
                position="Admin"
            )
            db.add(user)
            db.commit()
            print("Default superuser 'root' created.")
    except Exception as e:
        print(f"Error creating superuser: {e}")
    finally:
        db.close()

app = FastAPI(title="Base44 App Migration")

@app.on_event("startup")
async def startup_event():
    create_default_superuser()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(contact.router)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

# Serve Frontend
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

    from fastapi.responses import FileResponse
    @app.exception_handler(404)
    async def not_found(request, exc):
        return FileResponse("static/index.html")


# We will mount static files and frontend later
