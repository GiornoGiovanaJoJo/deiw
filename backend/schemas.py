from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    name_de: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    project_code: str
    name: str
    description: Optional[str] = None
    status: str
    year: int
    type: str
    size: Optional[str] = None
    color: Optional[str] = None
    end_date: Optional[date] = None
    category_id: Optional[int] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    category: Optional[Category] = None

    class Config:
        from_attributes = True

# Kunde Schemas
class KundeBase(BaseModel):
    firma: str

class KundeCreate(KundeBase):
    pass

class Kunde(KundeBase):
    id: int
    class Config:
        from_attributes = True

# Ware Schemas
class WareBase(BaseModel):
    name: str

class WareCreate(WareBase):
    pass

class Ware(WareBase):
    id: int
    class Config:
        from_attributes = True

# Aufgabe Schemas
class AufgabeBase(BaseModel):
    titel: str
    status: str
    prioritaet: str
    zugewiesen_name: Optional[str] = None

class AufgabeCreate(AufgabeBase):
    pass

class Aufgabe(AufgabeBase):
    id: int
    created_date: datetime
    class Config:
        from_attributes = True

# Dokument Schemas
class DokumentBase(BaseModel):
    name: str

class DokumentCreate(DokumentBase):
    pass

class Dokument(DokumentBase):
    id: int
    created_date: datetime
    class Config:
        from_attributes = True

# Contact Request Schemas
class ContactRequestBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: str
    reason: str
    message: str
    category_id: Optional[int] = None
    user_id: Optional[int] = None

class ContactRequestCreate(ContactRequestBase):
    pass

class ContactRequestUpdate(BaseModel):
    status: Optional[str] = None
    message_admin: Optional[str] = None

class ContactRequest(ContactRequestBase):
    id: int
    status: str
    message_admin: Optional[str] = None
    created_at: datetime
    category: Optional[Category] = None
    user: Optional[User] = None

    class Config:
        from_attributes = True
