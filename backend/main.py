from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import auth, admin, contact
import os

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Base44 App Migration")

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
