from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import database, models, schemas

router = APIRouter(
    prefix="/api/public",
    tags=["public"],
)

@router.get("/projects", response_model=List[schemas.Project])
def read_public_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    """
    Get all public projects (for landing page).
    """
    # Assuming all projects are public for now, or filter by status 'Completed' if needed.
    # For now returning all to match user request.
    projects = db.query(models.AdminProject).offset(skip).limit(limit).all()
    return projects

@router.get("/categories", response_model=List[schemas.Category])
def read_public_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    """
    Get all categories (services).
    """
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories
