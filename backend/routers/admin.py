from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, utils, database

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
)

# Categories
@router.post("/categories", response_model=schemas.Category)
def create_category(
    category: schemas.CategoryCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_superuser)
):
    db_cat = models.Category(**category.model_dump())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.get("/categories", response_model=List[schemas.Category])
def read_categories(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db)
):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_superuser)
):
    db_cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_cat)
    db.commit()
    return {"ok": True}

# Projects
@router.post("/projects", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_superuser)
):
    db_project = models.AdminProject(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[schemas.Project])
def read_projects(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db)
):
    projects = db.query(models.AdminProject).offset(skip).limit(limit).all()
    return projects

@router.get("/projects/{project_id}", response_model=schemas.Project)
def read_project(
    project_id: int, 
    db: Session = Depends(database.get_db)
):
    project = db.query(models.AdminProject).filter(models.AdminProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/projects/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project_update: schemas.ProjectCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_superuser)
):
    db_project = db.query(models.AdminProject).filter(models.AdminProject.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for key, value in project_update.model_dump().items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/projects/{project_id}")
def delete_project(
    project_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_superuser)
):
    db_project = db.query(models.AdminProject).filter(models.AdminProject.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"ok": True}

# Customers (Kunde)
@router.get("/customers", response_model=List[schemas.Kunde])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Kunde).offset(skip).limit(limit).all()

@router.post("/customers", response_model=schemas.Kunde)
def create_customer(item: schemas.KundeCreate, db: Session = Depends(database.get_db)):
    db_item = models.Kunde(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# Products (Ware)
@router.get("/products", response_model=List[schemas.Ware])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Ware).offset(skip).limit(limit).all()

@router.post("/products", response_model=schemas.Ware)
def create_product(item: schemas.WareCreate, db: Session = Depends(database.get_db)):
    db_item = models.Ware(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# Tasks (Aufgabe)
@router.get("/tasks", response_model=List[schemas.Aufgabe])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Aufgabe).offset(skip).limit(limit).all()

@router.post("/tasks", response_model=schemas.Aufgabe)
def create_task(item: schemas.AufgabeCreate, db: Session = Depends(database.get_db)):
    db_item = models.Aufgabe(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# Documents (Dokument)
@router.get("/documents", response_model=List[schemas.Dokument])
def read_documents(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Dokument).offset(skip).limit(limit).all()

@router.post("/documents", response_model=schemas.Dokument)
def create_document(item: schemas.DokumentCreate, db: Session = Depends(database.get_db)):
    db_item = models.Dokument(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
