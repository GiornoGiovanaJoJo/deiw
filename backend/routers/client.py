from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils, database

router = APIRouter(
    prefix="/api/client",
    tags=["client"],
)

@router.get("/projects", response_model=List[schemas.Project])
def read_my_projects(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_active_user)
):
    """
    Get all projects assigned to the current user.
    """
    return current_user.projects

@router.get("/requests", response_model=List[schemas.ContactRequest])
def read_my_requests(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_active_user)
):
    """
    Get all contact requests made by the current user.
    """
    return current_user.requests

@router.patch("/profile", response_model=schemas.User)
def update_my_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_active_user)
):
    """
    Update current user's profile.
    """
    # Exclude password/superuser fields for safety if reusing schema, 
    # but for now we'll just update safe fields based on a new safe schema or manual extraction
    # Actually, let's just update vorname, nachname, email.
    
    # NOTE: UserCreate requires password. We should probably accept a partial schema.
    # For now, let's assume the frontend sends what it can, but we'll only update specific fields.
    # Better approach: Create a simple Pydantic model here or in schemas for profile update.
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Security: Remove sensitive fields if they slipped in
    update_data.pop("password", None)
    update_data.pop("is_superuser", None)
    update_data.pop("is_active", None)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user
