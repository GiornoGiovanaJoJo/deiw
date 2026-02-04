from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, utils, database

router = APIRouter(
    prefix="/api/contact",
    tags=["contact"],
)

@router.post("/requests", response_model=schemas.ContactRequest)
def create_request(
    request: schemas.ContactRequestCreate, 
    db: Session = Depends(database.get_db)
):
    # Public endpoint to submit request
    db_request = models.ContactRequest(**request.model_dump())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/requests", response_model=List[schemas.ContactRequest])
def read_requests(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_superuser)
):
    requests = db.query(models.ContactRequest).offset(skip).limit(limit).all()
    return requests

@router.patch("/requests/{request_id}", response_model=schemas.ContactRequest)
def update_request_status(
    request_id: int,
    request_update: schemas.ContactRequestUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_superuser)
):
    db_request = db.query(models.ContactRequest).filter(models.ContactRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    update_data = request_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_request, key, value)
    
    db.commit()
    db.refresh(db_request)
    return db_request
